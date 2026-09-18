import { eq } from "drizzle-orm";
import { accounts, auditLogs, ledgerAccounts, trc20Deposits } from "../../drizzle/schema";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { applyReferralCommissionsOnLicense } from "./settlement-service";
import { getCurrentCycle } from "@/lib/cycle";

export async function confirmTrc20Deposit(input: {
  accountId: string;
  txHash: string;
  amountUsdt: number;
}): Promise<{ purpose: "license" | "topup"; credited: number }> {
  const db = getDb();
  const existing = await db.query.trc20Deposits.findFirst({
    where: eq(trc20Deposits.txHash, input.txHash),
  });
  if (existing) {
    if (existing.accountId !== input.accountId) {
      throw new Error("Deposit already claimed by another account");
    }
    return { purpose: existing.purpose as "license" | "topup", credited: parseFloat(existing.amountUsdt) };
  }

  const acct = await db.query.accounts.findFirst({ where: eq(accounts.id, input.accountId) });
  if (!acct) throw new Error("Account not found");

  const cycleId = getCurrentCycle().cycleId;
  let purpose: "license" | "topup" = "topup";
  let licenseCredit = "0";
  let availableAdd = String(input.amountUsdt);

  if (!acct.licenseActivated && input.amountUsdt >= LICENSE_FEE_USDT) {
    purpose = "license";
    licenseCredit = String(LICENSE_FEE_USDT);
    availableAdd = String(Math.max(0, input.amountUsdt - LICENSE_FEE_USDT));
    await db
      .update(accounts)
      .set({ licenseActivated: true })
      .where(eq(accounts.id, input.accountId));
    await applyReferralCommissionsOnLicense(input.accountId, cycleId);
  }

  await db.insert(trc20Deposits).values({
    accountId: input.accountId,
    txHash: input.txHash,
    amountUsdt: String(input.amountUsdt),
    purpose,
  });

  const ledger = await db.query.ledgerAccounts.findFirst({
    where: eq(ledgerAccounts.accountId, input.accountId),
  });

  if (ledger) {
    const avail = parseFloat(ledger.availableUsdt) + parseFloat(availableAdd);
    const lic = parseFloat(ledger.licenseCreditUsdt) + parseFloat(licenseCredit);
    await db
      .update(ledgerAccounts)
      .set({
        availableUsdt: String(avail),
        licenseCreditUsdt: String(lic),
        updatedAt: new Date(),
      })
      .where(eq(ledgerAccounts.accountId, input.accountId));
  } else {
    await db.insert(ledgerAccounts).values({
      accountId: input.accountId,
      availableUsdt: availableAdd,
      licenseCreditUsdt: licenseCredit,
    });
  }

  await db.insert(auditLogs).values({
    accountId: input.accountId,
    action: "trc20_deposit_confirmed",
    metadata: { txHash: input.txHash, amountUsdt: input.amountUsdt, purpose },
  });

  return { purpose, credited: input.amountUsdt };
}
