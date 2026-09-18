import { eq } from "drizzle-orm";
import { accounts } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { isValidTrc20Address } from "@/lib/tron-utils";

/** User-owned TRC-20 wallet (payout + deposit identity). Platform does not hold user keys. */
export async function setUserTronWallet(
  accountId: string,
  trc20Address: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = trc20Address.trim();
  if (!isValidTrc20Address(normalized)) {
    return { ok: false, error: "Invalid USDT TRC-20 address" };
  }

  const db = getDb();
  const taken = await db.query.accounts.findFirst({
    where: eq(accounts.usdtTrc20Payout, normalized),
  });
  if (taken && taken.id !== accountId) {
    return { ok: false, error: "This wallet is already linked to another account" };
  }

  await db
    .update(accounts)
    .set({
      usdtTrc20Payout: normalized,
      depositAddressTrc20: normalized,
    })
    .where(eq(accounts.id, accountId));

  return { ok: true };
}
