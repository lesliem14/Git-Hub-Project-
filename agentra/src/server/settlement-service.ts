import { and, eq, lte } from "drizzle-orm";
import {
  accounts,
  auditLogs,
  ledgerAccounts,
  referralEvents,
  settlementCycles,
  settlementLines,
  tradeLocks,
  users,
} from "../../drizzle/schema";
import { getCurrentCycle } from "@/lib/cycle";
import {
  computePerformanceFeeOnTradingProfit,
  computeSettlementTotal,
} from "@/lib/ledger";
import { LICENSE_FEE_USDT, REFERRAL_TIERS } from "@/lib/constants";
import type { SettlementLine } from "@/lib/types";
import { getDb } from "@/lib/db";

function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

function toLine(row: typeof settlementLines.$inferSelect, username: string): SettlementLine {
  return {
    id: row.id,
    userId: row.accountId,
    displayName: row.displayName || username,
    usdtWalletTrc20: row.usdtWalletTrc20,
    cycleId: row.cycleId,
    cycleEndsAt: new Date().toISOString(),
    tradingNetUsdt: num(row.tradingNetUsdt),
    referralCommissionsUsdt: num(row.referralCommissionsUsdt),
    performanceFeeUsdt: num(row.performanceFeeUsdt),
    platformFeesUsdt: num(row.platformFeesUsdt),
    adjustmentsUsdt: num(row.adjustmentsUsdt),
    totalDueUsdt: num(row.totalDueUsdt),
    status: row.status,
    ledgerVerified: row.ledgerVerified,
    paidAt: row.paidAt?.toISOString(),
    txHash: row.payoutTx ?? undefined,
  };
}

export async function releaseExpiredTradeLocks(): Promise<number> {
  const db = getDb();
  const now = new Date();
  const open = await db
    .select()
    .from(tradeLocks)
    .where(and(eq(tradeLocks.status, "open"), lte(tradeLocks.releasesAt, now)));

  for (const lock of open) {
    const ledger = await db.query.ledgerAccounts.findFirst({
      where: eq(ledgerAccounts.accountId, lock.accountId),
    });
    if (!ledger) continue;
    const locked = num(ledger.lockedInTradeUsdt);
    const avail = num(ledger.availableUsdt);
    const release = num(lock.amountUsdt);
    await db
      .update(tradeLocks)
      .set({ status: "released" })
      .where(eq(tradeLocks.id, lock.id));
    await db
      .update(ledgerAccounts)
      .set({
        lockedInTradeUsdt: String(Math.max(0, locked - release)),
        availableUsdt: String(avail + release),
        updatedAt: now,
      })
      .where(eq(ledgerAccounts.accountId, lock.accountId));
  }
  return open.length;
}

export async function closeSettlementCycle(): Promise<{ cycleId: string; lines: number }> {
  const db = getDb();
  const cycle = getCurrentCycle();
  const now = new Date();

  await releaseExpiredTradeLocks();

  await db
    .insert(settlementCycles)
    .values({
      id: cycle.cycleId,
      startsAt: new Date(cycle.startsAt),
      endsAt: new Date(cycle.endsAt),
      closedAt: now,
    })
    .onConflictDoUpdate({
      target: settlementCycles.id,
      set: { closedAt: now },
    });

  const accts = await db
    .select({
      account: accounts,
      user: users,
      ledger: ledgerAccounts,
    })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .leftJoin(ledgerAccounts, eq(ledgerAccounts.accountId, accounts.id));

  let count = 0;
  for (const row of accts) {
    if (!row.account.usdtTrc20Payout) continue;

    const pending = num(row.ledger?.pendingWithdrawableUsdt);
    const referralSum = await db
      .select()
      .from(referralEvents)
      .where(
        and(
          eq(referralEvents.beneficiaryAccountId, row.account.id),
          eq(referralEvents.cycleId, cycle.cycleId),
        ),
      );
    const referralTotal = referralSum.reduce((s, e) => s + num(e.commissionUsdt), 0);
    const tradingNet = pending;
    const performanceFeeUsdt = computePerformanceFeeOnTradingProfit(tradingNet);
    const totalDueUsdt = computeSettlementTotal({
      userId: row.account.id,
      displayName: row.user.username ?? "user",
      usdtWalletTrc20: row.account.usdtTrc20Payout,
      cycleId: cycle.cycleId,
      cycleEndsAt: cycle.endsAt,
      tradingNetUsdt: tradingNet,
      referralCommissionsUsdt: referralTotal,
      performanceFeeUsdt,
      platformFeesUsdt: 0,
      adjustmentsUsdt: 0,
      status: "pending",
    });

    if (totalDueUsdt <= 0 && tradingNet <= 0 && referralTotal <= 0) continue;

    await db
      .insert(settlementLines)
      .values({
        cycleId: cycle.cycleId,
        accountId: row.account.id,
        displayName: row.user.username ?? "user",
        usdtWalletTrc20: row.account.usdtTrc20Payout,
        tradingNetUsdt: String(tradingNet),
        referralCommissionsUsdt: String(referralTotal),
        performanceFeeUsdt: String(performanceFeeUsdt),
        platformFeesUsdt: "0",
        adjustmentsUsdt: "0",
        totalDueUsdt: String(totalDueUsdt),
        status: "pending",
      })
      .onConflictDoUpdate({
        target: [settlementLines.cycleId, settlementLines.accountId],
        set: {
          tradingNetUsdt: String(tradingNet),
          referralCommissionsUsdt: String(referralTotal),
          performanceFeeUsdt: String(performanceFeeUsdt),
          totalDueUsdt: String(totalDueUsdt),
        },
      });
    count += 1;
  }

  await db.insert(auditLogs).values({
    action: "settlement_cycle_closed",
    metadata: { cycleId: cycle.cycleId, lines: count },
  });

  return { cycleId: cycle.cycleId, lines: count };
}

export async function listSettlementLines(cycleId?: string): Promise<SettlementLine[]> {
  const db = getDb();
  const id = cycleId ?? getCurrentCycle().cycleId;
  const rows = await db
    .select({ line: settlementLines, user: users })
    .from(settlementLines)
    .innerJoin(accounts, eq(settlementLines.accountId, accounts.id))
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(eq(settlementLines.cycleId, id));
  return rows.map((r) => toLine(r.line, r.user.username ?? "user"));
}

export async function getUserSettlementLine(
  accountId: string,
  cycleId?: string,
): Promise<SettlementLine | null> {
  const db = getDb();
  const id = cycleId ?? getCurrentCycle().cycleId;
  const row = await db
    .select({ line: settlementLines, user: users })
    .from(settlementLines)
    .innerJoin(accounts, eq(settlementLines.accountId, accounts.id))
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(and(eq(settlementLines.cycleId, id), eq(settlementLines.accountId, accountId)))
    .limit(1);
  if (!row[0]) return null;
  return toLine(row[0].line, row[0].user.username ?? "user");
}

export async function markSettlementLinesProcessing(
  updates: { lineId: string; txHash: string }[],
): Promise<void> {
  const db = getDb();
  const now = new Date();
  for (const u of updates) {
    await db
      .update(settlementLines)
      .set({
        status: "processing",
        payoutTx: u.txHash,
        paidAt: now,
      })
      .where(eq(settlementLines.id, u.lineId));
  }
}

export async function verifySettlementLines(ids: string[]): Promise<string[]> {
  const db = getDb();
  const verified: string[] = [];
  for (const id of ids) {
    const row = await db.query.settlementLines.findFirst({ where: eq(settlementLines.id, id) });
    if (!row) continue;
    const ledger = await db.query.ledgerAccounts.findFirst({
      where: eq(ledgerAccounts.accountId, row.accountId),
    });
    const total = num(row.totalDueUsdt);
    const avail = num(ledger?.availableUsdt) + num(ledger?.pendingWithdrawableUsdt);
    if (total > 0 && total <= avail + num(row.tradingNetUsdt) + 10000) {
      await db
        .update(settlementLines)
        .set({ ledgerVerified: true })
        .where(eq(settlementLines.id, id));
      verified.push(id);
    }
  }
  return verified;
}

export async function applyReferralCommissionsOnLicense(
  buyerAccountId: string,
  cycleId: string,
): Promise<void> {
  const db = getDb();
  const buyer = await db.query.accounts.findFirst({ where: eq(accounts.id, buyerAccountId) });
  if (!buyer?.referredByAccountId) return;

  let currentId: string | null = buyer.referredByAccountId;
  for (const tier of REFERRAL_TIERS) {
    if (!currentId) break;
    const commission = LICENSE_FEE_USDT * tier.rate;
    await db.insert(referralEvents).values({
      beneficiaryAccountId: currentId,
      sourceAccountId: buyerAccountId,
      level: String(tier.level),
      commissionUsdt: String(commission),
      cycleId,
    });
    const beneficiaryLedger = await db.query.ledgerAccounts.findFirst({
      where: eq(ledgerAccounts.accountId, currentId),
    });
    if (beneficiaryLedger) {
      const pending = num(beneficiaryLedger.pendingWithdrawableUsdt) + commission;
      await db
        .update(ledgerAccounts)
        .set({ pendingWithdrawableUsdt: String(pending), updatedAt: new Date() })
        .where(eq(ledgerAccounts.accountId, currentId));
    }
    const upline: { referredByAccountId: string | null } | undefined =
      await db.query.accounts.findFirst({ where: eq(accounts.id, currentId) });
    currentId = upline?.referredByAccountId ?? null;
  }
}
