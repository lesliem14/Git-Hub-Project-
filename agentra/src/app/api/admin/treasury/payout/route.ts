import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { settlementBatch } from "@/lib/mock-data";
import type { SettlementLine } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ids } = (await request.json()) as { ids?: string[] };
  if (!ids?.length) {
    return NextResponse.json({ error: "No lines selected" }, { status: 400 });
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
    line.status = "processing";
    line.paidAt = now;
    line.txHash = `mock_tron_${line.id.slice(-6)}`;
  }
  const updated: SettlementLine[] = [...settlementBatch];

  return NextResponse.json({
    message: `Submitted ${ids.length} USDT TRC-20 transfers (simulated). Connect Tron treasury API for production.`,
    updated,
  });
}
