import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { isDatabaseConfigured } from "@/lib/db";
import { confirmTrc20Deposit } from "@/server/deposit-service";

/** Admin or indexer confirms an incoming USDT TRC-20 transfer. */
export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const body = (await request.json()) as {
    accountId?: string;
    txHash?: string;
    amountUsdt?: number;
  };

  if (!body.accountId || !body.txHash || !body.amountUsdt) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await confirmTrc20Deposit({
    accountId: body.accountId,
    txHash: body.txHash,
    amountUsdt: body.amountUsdt,
  });

  return NextResponse.json({ ok: true, ...result });
}
