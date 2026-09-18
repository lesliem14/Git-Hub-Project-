import { eq } from "drizzle-orm";
import { accounts, ledgerAccounts, tradeLocks, users } from "../../drizzle/schema";
import {
  demoActiveTrade,
  demoLedger,
  demoMetrics,
  demoUser,
  getUserSettlement,
  settlementBatch,
} from "@/lib/mock-data";
import { isDatabaseConfigured, getDb } from "@/lib/db";
import { getSessionUser } from "./auth-service";
import { getUserSettlementLine } from "./settlement-service";
import { getAccountAnalytics } from "./analytics-service";
import { getCurrentCycle } from "@/lib/cycle";
import type { ActiveTradeLock, InternalLedger, SettlementLine, UserProfile } from "@/lib/types";
function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

export async function getDashboardPayload(forcedAccountId?: string) {
  if (!isDatabaseConfigured()) {
    return {
      source: "mock" as const,
      user: demoUser,
      ledger: demoLedger,
      metrics: demoMetrics,
      activeTrade: demoActiveTrade,
      settlement: getUserSettlement(demoUser.id) ?? null,
    };
  }

  try {
    const session = await getSessionUser();
    const accountId = forcedAccountId ?? session?.accountId;
    if (!accountId) {
      return { source: "unauthenticated" as const };
    }

    const db = getDb();
    const row = await db
      .select({ account: accounts, user: users, ledger: ledgerAccounts })
      .from(accounts)
      .innerJoin(users, eq(accounts.userId, users.id))
      .leftJoin(ledgerAccounts, eq(ledgerAccounts.accountId, accounts.id))
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (!row[0]) {
      return {
        source: "mock" as const,
        user: demoUser,
        ledger: demoLedger,
        metrics: demoMetrics,
        activeTrade: demoActiveTrade,
        settlement: getUserSettlement(demoUser.id) ?? null,
      };
    }

    const { account, user, ledger } = row[0];
    const lock = await db.query.tradeLocks.findFirst({
      where: eq(tradeLocks.accountId, accountId),
    });

    const userProfile: UserProfile = {
      id: account.id,
      username: user.username ?? "user",
      email: user.email,
      walletAddress: account.evmAddress ?? "",
      usdtPayoutWallet: account.usdtTrc20Payout ?? "",
      licenseActivated: account.licenseActivated,
      subscriptionTier: account.licenseActivated ? "licensed" : "free",
    };

    const ledgerView: InternalLedger = {
      availableUsdt: num(ledger?.availableUsdt),
      licenseCreditUsdt: num(ledger?.licenseCreditUsdt),
      lockedInTradeUsdt: num(ledger?.lockedInTradeUsdt),
      evmWalletUsdtEstimate: 1240,
      pendingWithdrawableUsdt: num(ledger?.pendingWithdrawableUsdt),
      pendingPerformanceFeeUsdt: num(ledger?.pendingWithdrawableUsdt) * 0.1,
    };

    let activeTrade: ActiveTradeLock | null = null;
    if (lock && lock.status === "open") {
      activeTrade = {
        id: lock.id,
        amountUsdt: num(lock.amountUsdt),
        startedAt: lock.startedAt.toISOString(),
        releasesAt: lock.releasesAt.toISOString(),
        strategy: lock.strategy ?? "Strategy",
        status: "open",
      };
    }

    const settlement: SettlementLine | null = await getUserSettlementLine(accountId);
    const cycle = getCurrentCycle();
    const analytics = await getAccountAnalytics(accountId, new Date(cycle.startsAt));

    return {
      source: "database" as const,
      user: userProfile,
      ledger: ledgerView,
      metrics: {
        ...demoMetrics,
        ...analytics,
        portfolioUsdt:
          ledgerView.availableUsdt + ledgerView.licenseCreditUsdt + ledgerView.lockedInTradeUsdt,
        capitalAllocatedUsdt: ledgerView.availableUsdt + ledgerView.licenseCreditUsdt,
        riskExposureUsdt: ledgerView.lockedInTradeUsdt,
      },
      activeTrade,
      settlement,
    };
  } catch {
    return {
      source: "mock" as const,
      user: demoUser,
      ledger: demoLedger,
      metrics: demoMetrics,
      activeTrade: demoActiveTrade,
      settlement: getUserSettlement(demoUser.id) ?? null,
    };
  }
}

export async function getAdminSettlementBatch(): Promise<SettlementLine[]> {
  if (!isDatabaseConfigured()) return settlementBatch;
  try {
    const { listSettlementLines } = await import("./settlement-service");
    const lines = await listSettlementLines();
    return lines.length ? lines : settlementBatch;
  } catch {
    return settlementBatch;
  }
}
