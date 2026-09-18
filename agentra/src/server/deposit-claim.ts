import { eq } from "drizzle-orm";
import { trc20Deposits } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { confirmTrc20Deposit } from "./deposit-service";
import {
  getDepositVerificationDetail,
  verifyTreasuryUsdtDeposit,
} from "./tron-deposit-verify";

export async function claimDepositByTxHash(
  accountId: string,
  txHash: string,
): Promise<{
  ok: boolean;
  purpose?: "license" | "topup";
  credited?: number;
  error?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}> {
  const normalized = txHash.trim();
  if (!normalized) return { ok: false, error: "Transaction hash required" };

  const db = getDb();
  const existing = await db.query.trc20Deposits.findFirst({
    where: eq(trc20Deposits.txHash, normalized),
  });
  if (existing) {
    if (existing.accountId === accountId) {
      return {
        ok: true,
        purpose: existing.purpose as "license" | "topup",
        credited: parseFloat(existing.amountUsdt),
      };
    }
    return { ok: false, error: "This deposit was already claimed by another account" };
  }

  const verified = await verifyTreasuryUsdtDeposit(normalized);
  if (!verified) {
    const detail = await getDepositVerificationDetail(normalized);
    return {
      ok: false,
      error:
        detail.error ??
        "Could not verify USDT TRC-20 transfer to Agentra treasury. Check the hash and wait for confirmations.",
      confirmations: detail.confirmations,
      requiredConfirmations: detail.required,
    };
  }

  const result = await confirmTrc20Deposit({
    accountId,
    txHash: normalized,
    amountUsdt: verified.amountUsdt,
  });

  return {
    ok: true,
    purpose: result.purpose,
    credited: result.credited,
    confirmations: verified.confirmations,
    requiredConfirmations: verified.confirmations,
  };
}
