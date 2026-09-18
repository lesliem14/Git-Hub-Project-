import { NextResponse } from "next/server";
import { runEngineForAllAccounts } from "@/server/trading/pipeline";
import { releaseExpiredTradeLocks } from "@/server/settlement-service";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET ?? "dev-cron-secret";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const released = await releaseExpiredTradeLocks();
  const engine = await runEngineForAllAccounts();
  return NextResponse.json({ ok: true, releasedLocks: released, ...engine });
}
