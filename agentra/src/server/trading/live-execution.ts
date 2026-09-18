import { eq } from "drizzle-orm";
import { createPublicClient, http, toHex } from "viem";
import {
  accounts,
  auditLogs,
  botConfigs,
  executions,
  ledgerAccounts,
  opportunities,
  tradeLocks,
} from "../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { TRADE_LOCK_MS } from "@/lib/constants";
import { getLiveChainId, getLiveRpcUrl, getLiveTxMode } from "@/lib/live-chain";
import { requireActiveLicense } from "../licensing-service";
import { evaluateOpportunity, num } from "./tick-shared";
import { allowedSwapTargets, buildSwapTransactions } from "./swap-build";

export interface UnsignedLiveTransaction {
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas?: string;
  description: string;
  mode: "probe" | "swap";
  label?: string;
}

export interface LivePrepareResult {
  awaitingSignature: true;
  opportunityId: string;
  transaction: UnsignedLiveTransaction;
  transactions?: UnsignedLiveTransaction[];
  step?: number;
  totalSteps?: number;
  swapStyle?: string;
  opportunity: object;
}

function buildProbeTransaction(
  from: `0x${string}`,
  chainId: number,
  opportunityId: string,
  netUsdt: number,
): UnsignedLiveTransaction {
  const memo = toHex(
    new TextEncoder().encode(
      JSON.stringify({
        v: 1,
        app: "agentra",
        op: "live_attestation",
        opportunityId,
        netUsdt,
      }),
    ),
  );
  return {
    chainId,
    to: from,
    data: memo,
    value: "0x0",
    gas: "120000",
    description:
      "Live attestation (0 value self-call). Confirms wallet control before ledger credit. Use Sepolia for testing.",
    mode: "probe",
  };
}

export async function runLivePrepare(
  accountId: string,
  fromAddress: string,
): Promise<LivePrepareResult | { awaitingSignature: false; reason: string }> {
  const license = await requireActiveLicense(accountId);
  if (!license.ok) return { awaitingSignature: false, reason: license.reason };

  const from = fromAddress.trim().toLowerCase() as `0x${string}`;
  if (!/^0x[a-f0-9]{40}$/.test(from)) {
    return { awaitingSignature: false, reason: "invalid from address" };
  }

  const db = getDb();
  const bot = await db.query.botConfigs.findFirst({ where: eq(botConfigs.accountId, accountId) });
  if (!bot || bot.status !== "running") {
    return { awaitingSignature: false, reason: "bot not running" };
  }
  if (bot.mode !== "live") {
    return { awaitingSignature: false, reason: "bot not in live mode" };
  }

  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
  if (!account?.evmAddress) {
    return { awaitingSignature: false, reason: "link EVM wallet in Settings (signature required)" };
  }
  if (account.evmAddress.toLowerCase() !== from) {
    return { awaitingSignature: false, reason: "connected wallet does not match linked EVM address" };
  }

  const { opp, score, shouldExecute, reason } = await evaluateOpportunity(bot);
  if (!shouldExecute) return { awaitingSignature: false, reason };

  const chainId = getLiveChainId();
  const txMode = getLiveTxMode();

  const [oppRow] = await db
    .insert(opportunities)
    .values({
      accountId,
      chainId: String(chainId),
      strategy: opp.strategy,
      expectedGrossUsdt: String(opp.grossUsdt),
      expectedNetUsdt: String(opp.netUsdt),
      executeScore: String(score.probability),
      payload: {
        ...opp,
        liveStatus: "pending_signature",
        fromAddress: from,
        txMode,
      },
    })
    .returning();

  const maxTrade = num(bot.maxTradeSizeUsdt);
  let transaction = buildProbeTransaction(from, chainId, oppRow.id, opp.netUsdt);
  let transactions: UnsignedLiveTransaction[] | undefined;
  let swapStyle: string | undefined;

  if (txMode === "swap") {
    const built = buildSwapTransactions({
      from,
      maxTradeUsdt: maxTrade,
      strategy: opp.strategy,
    });
    if (built.transactions.length > 0) {
      transactions = built.transactions;
      swapStyle = built.style;
      transaction = built.transactions[0];
    } else {
      transaction = {
        ...buildProbeTransaction(from, chainId, oppRow.id, opp.netUsdt),
        description: `Swap build failed (${built.error ?? "unknown"}). Falling back to probe attestation.`,
      };
    }
  }

  await db
    .update(opportunities)
    .set({
      payload: {
        ...opp,
        liveStatus: "pending_signature",
        fromAddress: from,
        transaction,
        transactions,
        swapStyle,
        txMode,
        signStep: 0,
      },
    })
    .where(eq(opportunities.id, oppRow.id));

  return {
    awaitingSignature: true,
    opportunityId: oppRow.id,
    transaction,
    transactions,
    step: 1,
    totalSteps: transactions?.length ?? 1,
    swapStyle,
    opportunity: opp,
  };
}

/** Next unsigned tx after user completed on-chain step (e.g. approve → swap). */
export async function getLiveSignStep(
  accountId: string,
  opportunityId: string,
): Promise<
  | { done: false; transaction: UnsignedLiveTransaction; step: number; totalSteps: number }
  | { done: true; reason: string }
> {
  const db = getDb();
  const row = await db.query.opportunities.findFirst({ where: eq(opportunities.id, opportunityId) });
  if (!row || row.accountId !== accountId) {
    return { done: true, reason: "not found" };
  }
  const payload = (row.payload ?? {}) as {
    transactions?: UnsignedLiveTransaction[];
    signStep?: number;
    liveStatus?: string;
  };
  if (payload.liveStatus === "confirmed") {
    return { done: true, reason: "already confirmed" };
  }
  const txs = payload.transactions;
  if (!txs?.length) {
    return { done: true, reason: "single-step only" };
  }
  const nextIndex = payload.signStep ?? 0;
  if (nextIndex >= txs.length) {
    return { done: true, reason: "awaiting confirm" };
  }
  return {
    done: false,
    transaction: txs[nextIndex],
    step: nextIndex + 1,
    totalSteps: txs.length,
  };
}

export async function advanceLiveSignStep(
  accountId: string,
  opportunityId: string,
  txHash: string,
): Promise<void> {
  const db = getDb();
  const row = await db.query.opportunities.findFirst({ where: eq(opportunities.id, opportunityId) });
  if (!row || row.accountId !== accountId) return;
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const step = (payload.signStep as number | undefined) ?? 0;
  await db
    .update(opportunities)
    .set({
      payload: {
        ...payload,
        signStep: step + 1,
        stepTxHashes: [...((payload.stepTxHashes as string[] | undefined) ?? []), txHash],
      },
    })
    .where(eq(opportunities.id, opportunityId));
}

export async function confirmLiveExecution(input: {
  accountId: string;
  opportunityId: string;
  txHash: string;
  fromAddress: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const oppRow = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, input.opportunityId),
  });
  if (!oppRow || oppRow.accountId !== input.accountId) {
    return { ok: false, error: "Opportunity not found" };
  }

  const payload = (oppRow.payload ?? {}) as Record<string, unknown>;
  if (payload.liveStatus === "confirmed") {
    return { ok: false, error: "Already confirmed" };
  }

  const chainId = getLiveChainId();
  const client = createPublicClient({ transport: http(getLiveRpcUrl(chainId)) });

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: input.txHash as `0x${string}` });
  } catch {
    return { ok: false, error: "Transaction not found on chain yet — retry in a few seconds" };
  }

  if (receipt.status !== "success") {
    return { ok: false, error: "Transaction reverted on chain" };
  }

  const tx = await client.getTransaction({ hash: input.txHash as `0x${string}` });
  if (tx.from.toLowerCase() !== input.fromAddress.toLowerCase()) {
    return { ok: false, error: "Signer mismatch" };
  }

  const txMode = (payload.txMode as string | undefined) ?? "probe";
  if (txMode === "swap") {
    const allowed = allowedSwapTargets(chainId);
    const to = tx.to?.toLowerCase();
    if (!to || !allowed.has(to)) {
      return { ok: false, error: "Transaction target is not an allowlisted DEX contract" };
    }
  }

  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, input.accountId) });
  if (account?.evmAddress?.toLowerCase() !== tx.from.toLowerCase()) {
    return { ok: false, error: "Wallet not linked to account" };
  }

  const bot = await db.query.botConfigs.findFirst({ where: eq(botConfigs.accountId, input.accountId) });
  const maxTrade = num(bot?.maxTradeSizeUsdt);
  const opp = payload as { grossUsdt?: number; netUsdt?: number; gasUsdt?: number; feesUsdt?: number; strategy?: string };
  const gross = opp.grossUsdt ?? num(oppRow.expectedGrossUsdt);
  const net = opp.netUsdt ?? num(oppRow.expectedNetUsdt);
  const gas = opp.gasUsdt ?? 0;
  const fees = opp.feesUsdt ?? 0;
  const strategy = opp.strategy ?? oppRow.strategy;

  const tradeSize = Math.min(maxTrade, gross * 10);
  const now = new Date();
  const releases = new Date(now.getTime() + TRADE_LOCK_MS);

  const ledger = await db.query.ledgerAccounts.findFirst({
    where: eq(ledgerAccounts.accountId, input.accountId),
  });
  if (!ledger) return { ok: false, error: "no ledger" };

  const avail = num(ledger.availableUsdt);
  if (avail < tradeSize * 0.1) {
    return { ok: false, error: "insufficient ledger allocation for live trade lock" };
  }

  await db.insert(tradeLocks).values({
    accountId: input.accountId,
    amountUsdt: String(tradeSize),
    startedAt: now,
    releasesAt: releases,
    strategy,
    status: "open",
  });

  await db
    .update(ledgerAccounts)
    .set({
      availableUsdt: String(Math.max(0, avail - tradeSize * 0.1)),
      lockedInTradeUsdt: String(num(ledger.lockedInTradeUsdt) + tradeSize * 0.1),
      pendingWithdrawableUsdt: String(num(ledger.pendingWithdrawableUsdt) + Math.max(0, net)),
      updatedAt: now,
    })
    .where(eq(ledgerAccounts.accountId, input.accountId));

  await db.insert(executions).values({
    accountId: input.accountId,
    opportunityId: input.opportunityId,
    mode: "live",
    strategy,
    grossUsdt: String(gross),
    gasUsdt: String(gas),
    feesUsdt: String(fees),
    netUsdt: String(net),
    status: "success",
    txHash: input.txHash,
  });

  await db
    .update(opportunities)
    .set({
      payload: {
        ...payload,
        liveStatus: "confirmed",
        txHash: input.txHash,
        confirmedAt: now.toISOString(),
      },
    })
    .where(eq(opportunities.id, input.opportunityId));

  await db.insert(auditLogs).values({
    accountId: input.accountId,
    action: "live_execution_confirmed",
    metadata: { txHash: input.txHash, opportunityId: input.opportunityId, netUsdt: net },
  });

  return { ok: true };
}
