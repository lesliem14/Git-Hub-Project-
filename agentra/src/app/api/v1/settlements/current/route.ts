import { NextResponse } from "next/server";
import { getCurrentCycle } from "@/lib/cycle";
import { isDatabaseConfigured } from "@/lib/db";
import { settlementBatch, settlementTotals } from "@/lib/mock-data";
import { getSessionUser } from "@/server/auth-service";
import { getUserSettlementLine } from "@/server/settlement-service";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycle = getCurrentCycle();

  if (isDatabaseConfigured()) {
    try {
      const line = await getUserSettlementLine(session.accountId);
      return NextResponse.json({
        cycle,
        line,
        totals: line
          ? settlementTotals([line])
          : { totalDue: 0, pending: 0, paid: 0, verified: 0 },
        source: "database",
      });
    } catch (e) {
      console.error(e);
    }
  }

  const line = settlementBatch.find((l) => l.userId === session.accountId) ?? null;
  return NextResponse.json({
    cycle,
    line,
    totals: line ? settlementTotals([line]) : { totalDue: 0, pending: 0, paid: 0, verified: 0 },
    source: "mock",
  });
}
