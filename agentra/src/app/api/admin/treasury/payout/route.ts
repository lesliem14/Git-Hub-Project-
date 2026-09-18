import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { isDatabaseConfigured } from "@/lib/db";
import { settlementBatch } from "@/lib/mock-data";
import type { SettlementLine } from "@/lib/types";
import {
  listSettlementLines,
  markSettlementLinesFailed,
  markSettlementLinesPaid,
  markSettlementLinesProcessing,
} from "@/server/settlement-service";
import { mapLinesToPayoutItems, sendUsdtTrc20Batch } from "@/server/tron-treasury";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ids } = (await request.json()) as { ids?: string[] };
  if (!ids?.length) {
    return NextResponse.json({ error: "No lines selected" }, { status: 400 });
  }

  let lines: SettlementLine[] = [];
  if (isDatabaseConfigured()) {
    try {
      const all = await listSettlementLines();
      lines = all.filter((l) => ids.includes(l.id));
      const unverified = lines.filter((l) => !l.ledgerVerified);
      if (unverified.length) {
        return NextResponse.json(
          { error: "Verify ledger before payout.", unverified: unverified.map((l) => l.id) },
          { status: 400 },
        );
      }

      await markSettlementLinesProcessing(lines.map((l) => ({ lineId: l.id })));

      const batch = await sendUsdtTrc20Batch(mapLinesToPayoutItems(lines));

      const paid = batch.transfers.filter((t) => t.success);
      const failed = batch.transfers.filter((t) => !t.success);

      await markSettlementLinesPaid(paid.map((t) => ({ lineId: t.lineId, txHash: t.txHash })));
      await markSettlementLinesFailed(failed.map((t) => t.lineId));

      const updated = await listSettlementLines();
      return NextResponse.json({
        message: `Treasury batch ${batch.batchId} (${batch.mode}): ${batch.transfers.filter((t) => t.success).length}/${batch.transfers.length} sent.`,
        batch,
        updated,
      });
    } catch (e) {
      console.error(e);
    }
  }

  const now = new Date().toISOString();
  for (const id of ids) {
    const line = settlementBatch.find((l) => l.id === id);
    if (!line || line.status === "paid") continue;
    if (!line.ledgerVerified) {
      return NextResponse.json(
        { error: "Verify ledger before payout.", unverified: [id] },
        { status: 400 },
      );
    }
    line.status = "paid";
    line.paidAt = now;
    line.txHash = `mock_tron_${line.id.slice(-6)}`;
  }

  const mockLines = settlementBatch.filter((l) => ids.includes(l.id));
  const batch = await sendUsdtTrc20Batch(mapLinesToPayoutItems(mockLines));

  return NextResponse.json({
    message: `Submitted ${ids.length} transfers (mock DB).`,
    batch,
    updated: [...settlementBatch],
  });
}
