import { eq, isNull } from "drizzle-orm";
import { accounts, depositAddressPool } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { isTronHdConfigured, mintNextPoolDepositAddress } from "./tron-hd-wallet";

export async function assignDepositAddress(accountId: string): Promise<string | null> {
  const db = getDb();
  const acct = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
  if (!acct) return null;
  if (acct.depositAddressTrc20) return acct.depositAddressTrc20;

  let free = await db.query.depositAddressPool.findFirst({
    where: isNull(depositAddressPool.accountId),
  });

  if (!free && isTronHdConfigured()) {
    const minted = await mintNextPoolDepositAddress();
    if (minted) {
      free = await db.query.depositAddressPool.findFirst({
        where: eq(depositAddressPool.address, minted.address),
      });
    }
  }

  if (!free) return null;

  const now = new Date();
  await db
    .update(depositAddressPool)
    .set({ accountId, assignedAt: now })
    .where(eq(depositAddressPool.address, free.address));
  await db
    .update(accounts)
    .set({ depositAddressTrc20: free.address })
    .where(eq(accounts.id, accountId));

  return free.address;
}
