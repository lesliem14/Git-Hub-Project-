import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/server/auth-service";
import { claimDepositByTxHash } from "@/server/deposit-claim";

/** Claim a treasury deposit by tx hash (sender can be any USDT TRC-20 wallet). */
export async function POST(request: Request) {
  const rl = rateLimit(`claim:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required" }, { status: 503 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in to claim a deposit" }, { status: 401 });
  }

  const body = (await request.json()) as { txHash?: string };
  if (!body.txHash) {
    return NextResponse.json({ error: "txHash required" }, { status: 400 });
  }

  const result = await claimDepositByTxHash(session.accountId, body.txHash);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        confirmations: result.confirmations,
        requiredConfirmations: result.requiredConfirmations,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    purpose: result.purpose,
    creditedUsdt: result.credited,
  });
}
