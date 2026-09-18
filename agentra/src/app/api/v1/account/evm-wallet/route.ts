import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";
import { createLinkChallenge, linkEvmWallet } from "@/server/evm-wallet-service";
import { accounts } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ linked: false, address: null });
  }
  const db = getDb();
  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, session.accountId) });
  return NextResponse.json({
    linked: Boolean(account?.evmAddress),
    address: account?.evmAddress ?? null,
  });
}

/** POST { address, signature, message } or GET challenge via ?address= */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required" }, { status: 503 });
  }

  const body = (await request.json()) as {
    address?: string;
    signature?: string;
    message?: string;
    challengeOnly?: boolean;
  };

  if (!body.address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  if (body.challengeOnly || !body.signature) {
    const challenge = await createLinkChallenge(session.accountId, body.address);
    return NextResponse.json(challenge);
  }

  if (!body.message || !body.signature) {
    return NextResponse.json({ error: "message and signature required" }, { status: 400 });
  }

  const result = await linkEvmWallet({
    accountId: session.accountId,
    address: body.address,
    signature: body.signature,
    message: body.message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, address: body.address.toLowerCase() });
}
