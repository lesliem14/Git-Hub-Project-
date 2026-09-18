import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { accounts, users } from "../../../../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";
import { getBotConfig } from "@/server/bot-service";
import { demoUser } from "@/lib/mock-data";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      user: demoUser,
      license: { active: demoUser.licenseActivated, tier: demoUser.subscriptionTier },
      bot: null,
    });
  }

  const db = getDb();
  const row = await db
    .select({ account: accounts, user: users })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(eq(accounts.id, session.accountId))
    .limit(1);

  if (!row[0]) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const { account, user } = row[0];
  const bot = await getBotConfig(session.accountId);

  return NextResponse.json({
    user: {
      id: account.id,
      username: user.username,
      email: user.email,
      walletAddress: account.evmAddress,
      usdtPayoutWallet: account.usdtTrc20Payout,
      licenseActivated: account.licenseActivated,
      subscriptionTier: account.licenseActivated ? "licensed" : "free",
      referralCode: account.referralCode,
    },
    license: {
      active: account.licenseActivated,
      tier: account.licenseActivated ? "licensed" : "free",
    },
    bot,
  });
}
