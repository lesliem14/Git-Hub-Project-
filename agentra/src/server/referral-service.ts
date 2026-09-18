import { eq, sql, desc } from "drizzle-orm";
import { accounts, referralEvents, users } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { LICENSE_FEE_USDT, REFERRAL_TIERS } from "@/lib/constants";

function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

export async function getReferralStats(accountId: string) {
  const db = getDb();
  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
  if (!account) return null;

  const directReferrals = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(accounts)
    .where(eq(accounts.referredByAccountId, accountId));

  const commissions = await db
    .select()
    .from(referralEvents)
    .where(eq(referralEvents.beneficiaryAccountId, accountId))
    .orderBy(desc(referralEvents.createdAt))
    .limit(50);

  const totalEarned = commissions.reduce((s, e) => s + num(e.commissionUsdt), 0);

  const recent = await db
    .select({ account: accounts, user: users })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(eq(accounts.referredByAccountId, accountId))
    .orderBy(desc(accounts.createdAt))
    .limit(10);

  return {
    referralCode: account.referralCode,
    directReferrals: directReferrals[0]?.count ?? 0,
    totalCommissionsUsdt: totalEarned,
    tiers: REFERRAL_TIERS.map((t) => ({
      ...t,
      exampleUsdt: LICENSE_FEE_USDT * t.rate,
    })),
    recentReferrals: recent.map((r) => ({
      username: r.user.username ?? "user",
      licenseActivated: r.account.licenseActivated,
      joinedAt: r.account.createdAt.toISOString(),
    })),
    recentCommissions: commissions.slice(0, 10).map((c) => ({
      level: num(c.level),
      commissionUsdt: num(c.commissionUsdt),
      cycleId: c.cycleId,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
