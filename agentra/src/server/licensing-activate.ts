import { eq } from "drizzle-orm";
import { accounts, auditLogs, ledgerAccounts, subscriptions } from "../../drizzle/schema";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { getCurrentCycle } from "@/lib/cycle";
import { applyReferralCommissionsOnLicense } from "./settlement-service";

/** Activate license + $100 non-withdrawable credit (same economics as TRC-20 license deposit). */
export async function activateSoftwareLicense(
  accountId: string,
  source: "stripe" | "trc20" | "admin",
  externalId?: string,
): Promise<{ alreadyActive: boolean }> {
  const db = getDb();
  const acct = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
  if (!acct) throw new Error("Account not found");

  if (acct.licenseActivated) {
    return { alreadyActive: true };
  }

  const cycleId = getCurrentCycle().cycleId;
  await db.update(accounts).set({ licenseActivated: true }).where(eq(accounts.id, accountId));

  const existingSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.accountId, accountId),
  });
  if (!existingSub) {
    await db.insert(subscriptions).values({
      accountId,
      tier: "licensed",
      status: "active",
      stripeCustomerId: source === "stripe" ? externalId : undefined,
    });
  }

  const ledger = await db.query.ledgerAccounts.findFirst({
    where: eq(ledgerAccounts.accountId, accountId),
  });
  const licCredit = String(LICENSE_FEE_USDT);
  if (ledger) {
    const lic = parseFloat(ledger.licenseCreditUsdt) + LICENSE_FEE_USDT;
    await db
      .update(ledgerAccounts)
      .set({ licenseCreditUsdt: String(lic), updatedAt: new Date() })
      .where(eq(ledgerAccounts.accountId, accountId));
  } else {
    await db.insert(ledgerAccounts).values({
      accountId,
      licenseCreditUsdt: licCredit,
    });
  }

  await applyReferralCommissionsOnLicense(accountId, cycleId);

  await db.insert(auditLogs).values({
    accountId,
    action: "license_activated",
    metadata: { source, externalId },
  });

  return { alreadyActive: false };
}
