import { NextResponse } from "next/server";
import { settlementBatch, settlementTotals } from "@/lib/mock-data";
import { getCurrentCycle } from "@/lib/cycle";

export async function GET() {
  const cycle = getCurrentCycle();
  return NextResponse.json({
    cycle,
    lines: settlementBatch,
    totals: settlementTotals(settlementBatch),
  });
}
