import { eq } from "drizzle-orm";
import {
  auditLogs,
  botConfigs,
  executions,
  ledgerAccounts,
  opportunities,
  tradeLocks,
} from "../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { TRADE_LOCK_MS } from "@/lib/constants";
import { requireActiveLicense } from "../licensing-service";
import { evaluateOpportunity, num, randomOpportunity } from "./tick-shared";

export { randomOpportunity };

export async function runPaperTick(accountId: string): Promise<{ executed: boolean; reason: string }> {
  const license = await requireActiveLicense(accountId);
  if (!license.ok) return { executed: false, reason: license.reason };

  const db = getDb();
  const bot = await db.query.botConfigs.findFirst({ where: eq(botConfigs.accountId, accountId) });
  if (!bot || bot.status !== "running") {
    return { executed: false, reason: "bot not running" };
  }
  if (bot.mode !== "paper") {
    return { executed: false, reason: "use live tick with connected wallet for live mode" };
  }

  const { opp, score, shouldExecute, reason } = await evaluateOpportunity(bot);

  const [oppRow] = await db
    .insert(opportunities)
    .values({
      accountId,
      strategy: opp.strategy,
      expectedGrossUsdt: String(opp.grossUsdt),
      expectedNetUsdt: String(opp.netUsdt),
      executeScore: String(score.probability),
      payload: opp,
    })
    .returning();

  if (!shouldExecute) {
    return { executed: false, reason };
  }

  const tradeSize = Math.min(num(bot.maxTradeSizeUsdt), opp.grossUsdt * 10);
  const now = new Date();
  const releases = new Date(now.getTime() + TRADE_LOCK_MS);

  const ledger = await db.query.ledgerAccounts.findFirst({
    where: eq(ledgerAccounts.accountId, accountId),
  });
  if (!ledger) return { executed: false, reason: "no ledger" };

  const avail = num(ledger.availableUsdt);
  if (avail < tradeSize * 0.1) {
    return { executed: false, reason: "insufficient available balance" };
  }

  await db.insert(tradeLocks).values({
    accountId,
    amountUsdt: String(tradeSize),
    startedAt: now,
    releasesAt: releases,
    strategy: opp.strategy,
    status: "open",
  });

  await db
    .update(ledgerAccounts)
    .set({
      availableUsdt: String(Math.max(0, avail - tradeSize * 0.1)),
      lockedInTradeUsdt: String(num(ledger.lockedInTradeUsdt) + tradeSize * 0.1),
      pendingWithdrawableUsdt: String(num(ledger.pendingWithdrawableUsdt) + Math.max(0, opp.netUsdt)),
      updatedAt: now,
    })
    .where(eq(ledgerAccounts.accountId, accountId));

  await db.insert(executions).values({
    accountId,
    opportunityId: oppRow.id,
    mode: "paper",
    strategy: opp.strategy,
    grossUsdt: String(opp.grossUsdt),
    gasUsdt: String(opp.gasUsdt),
    feesUsdt: String(opp.feesUsdt),
    netUsdt: String(opp.netUsdt),
    status: "success",
    txHash: `paper_${Date.now()}`,
  });

  await db.insert(auditLogs).values({
    accountId,
    action: "paper_execution",
    metadata: { netUsdt: opp.netUsdt, strategy: opp.strategy, score },
  });

  return { executed: true, reason: "paper trade simulated" };
}

export async function runEngineForAllAccounts(): Promise<{ accounts: number; executed: number }> {
  const db = getDb();
  const running = await db.select().from(botConfigs);
  let executed = 0;
  for (const b of running) {
    if (b.status !== "running" || b.mode !== "paper") continue;
    const r = await runPaperTick(b.accountId);
    if (r.executed) executed += 1;
  }
  return { accounts: running.length, executed };
}
