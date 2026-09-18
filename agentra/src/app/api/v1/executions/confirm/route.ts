import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import {
  advanceLiveSignStep,
  confirmLiveExecution,
  getLiveSignStep,
} from "@/server/trading/live-execution";
import { isDatabaseConfigured, getDb } from "@/lib/db";
import { opportunities } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http } from "viem";
import { getLiveChainId, getLiveRpcUrl } from "@/lib/live-chain";

async function verifyTx(fromAddress: string, txHash: string) {
  const chainId = getLiveChainId();
  const client = createPublicClient({ transport: http(getLiveRpcUrl(chainId)) });
  const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  if (receipt.status !== "success") throw new Error("Transaction reverted on chain");
  const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
  if (tx.from.toLowerCase() !== fromAddress.toLowerCase()) throw new Error("Signer mismatch");
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required" }, { status: 503 });
  }

  const body = (await request.json()) as {
    opportunityId?: string;
    txHash?: string;
    fromAddress?: string;
  };

  if (!body.opportunityId || !body.txHash || !body.fromAddress) {
    return NextResponse.json(
      { error: "opportunityId, txHash, and fromAddress required" },
      { status: 400 },
    );
  }

  try {
    await verifyTx(body.fromAddress, body.txHash);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "On-chain verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const db = getDb();
  const row = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, body.opportunityId),
  });
  if (!row || row.accountId !== session.accountId) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const payload = (row.payload ?? {}) as {
    transactions?: unknown[];
    signStep?: number;
  };
  const multi = payload.transactions?.length ?? 0;

  await advanceLiveSignStep(session.accountId, body.opportunityId!, body.txHash);

  const updated = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, body.opportunityId),
  });
  const signStep = ((updated?.payload as { signStep?: number })?.signStep ?? 0) as number;

  if (multi > 1 && signStep < multi) {
    const next = await getLiveSignStep(session.accountId, body.opportunityId!);
    if (!next.done) {
      return NextResponse.json({
        ok: true,
        partial: true,
        transaction: next.transaction,
        step: next.step,
        totalSteps: next.totalSteps,
      });
    }
  }

  const result = await confirmLiveExecution({
    accountId: session.accountId,
    opportunityId: body.opportunityId,
    txHash: body.txHash,
    fromAddress: body.fromAddress,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, completed: true });
}
