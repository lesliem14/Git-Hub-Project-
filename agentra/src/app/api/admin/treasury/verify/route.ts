import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { isDatabaseConfigured } from "@/lib/db";
import { settlementBatch } from "@/lib/mock-data";
import { verifySettlementAgainstLedger } from "@/lib/ledger";
import { verifySettlementLines } from "@/server/settlement-service";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ids } = (await request.json()) as { ids?: string[] };
  if (!ids?.length) {
    return NextResponse.json({ error: "No lines selected" }, { status: 400 });
  }

  if (isDatabaseConfigured()) {
    try {
      const verifiedIds = await verifySettlementLines(ids);
      return NextResponse.json({
        verifiedIds,
        message: `Verified ${verifiedIds.length} of ${ids.length} lines against PostgreSQL ledger.`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  const verifiedIds: string[] = [];
  for (const id of ids) {
    const line = settlementBatch.find((l) => l.id === id);
    if (!line) continue;
    const result = verifySettlementAgainstLedger(line, 1_000_000);
    if (result.ok) {
      line.ledgerVerified = true;
      verifiedIds.push(id);
    }
  }

  return NextResponse.json({
    verifiedIds,
    message: `Verified ${verifiedIds.length} of ${ids.length} lines (mock ledger).`,
  });
}
