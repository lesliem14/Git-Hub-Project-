import { eq } from "drizzle-orm";
import { accounts } from "../../drizzle/schema";
import { getDb } from "@/lib/db";

export async function requireActiveLicense(
  accountId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
  if (!account) return { ok: false, reason: "account not found" };
  if (!account.licenseActivated) {
    return {
      ok: false,
      reason: "License required — fund with 100 USDT TRC-20 and claim tx on /fund",
    };
  }
  return { ok: true };
}
