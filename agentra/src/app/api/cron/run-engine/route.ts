import { NextResponse } from "next/server";
import { runEngineForAllAccounts } from "@/server/trading/pipeline";
import { releaseExpiredTradeLocks } from "@/server/settlement-service";
import { assertCronAuth } from "../_shared";

async function handleRunEngine(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;
  const released = await releaseExpiredTradeLocks();
  const engine = await runEngineForAllAccounts();
  return NextResponse.json({ ok: true, releasedLocks: released, ...engine });
}

export async function POST(request: Request) {
  return handleRunEngine(request);
}

export async function GET(request: Request) {
  return handleRunEngine(request);
}
