import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { runTronDepositIndexer } from "@/server/tron-indexer";
import { assertCronAuth } from "../_shared";

async function handleIndexTronDeposits(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const result = await runTronDepositIndexer();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return handleIndexTronDeposits(request);
}

export async function GET(request: Request) {
  return handleIndexTronDeposits(request);
}
