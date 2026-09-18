import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { closeSettlementCycle } from "@/server/settlement-service";
import { assertCronAuth } from "../_shared";

async function handleCloseSettlementCycle(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured", simulated: true },
      { status: 503 },
    );
  }

  const result = await closeSettlementCycle();
  return NextResponse.json({
    ok: true,
    ...result,
    adminNotify: "Treasury review required at /admin/treasury",
  });
}

export async function POST(request: Request) {
  return handleCloseSettlementCycle(request);
}

export async function GET(request: Request) {
  return handleCloseSettlementCycle(request);
}
