import { NextResponse } from "next/server";
import { settlementBatch, settlementTotals } from "@/lib/mock-data";
import { getCurrentCycle } from "@/lib/cycle";
import { isDatabaseConfigured } from "@/lib/db";
import { listSettlementLines } from "@/server/settlement-service";
import { isAdminSession } from "@/lib/admin-session";

export async function GET() {
  const cycle = getCurrentCycle();
  if (isDatabaseConfigured() && (await isAdminSession())) {
    try {
      const lines = await listSettlementLines();
      return NextResponse.json({
        cycle,
        lines,
        totals: settlementTotals(lines),
        source: "database",
      });
    } catch (e) {
      console.error(e);
    }
  }
  return NextResponse.json({
    cycle,
    lines: settlementBatch,
    totals: settlementTotals(settlementBatch),
    source: "mock",
  });
}
