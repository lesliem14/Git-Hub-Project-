import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { accounts } from "../../../../../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";
import { isStripeEnabled } from "@/server/stripe-service";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ licenseActivated: false, stripeEnabled: isStripeEnabled() });
  }

  const db = getDb();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, session.accountId),
  });

  return NextResponse.json({
    licenseActivated: account?.licenseActivated ?? false,
    stripeEnabled: isStripeEnabled(),
    evmLinked: Boolean(account?.evmAddress),
    usdtPayout: account?.usdtTrc20Payout ?? null,
  });
}
