import { eq } from "drizzle-orm";
import { verifyMessage } from "viem";
import { accounts, auditLogs } from "../../drizzle/schema";
import { getDb } from "@/lib/db";

export function buildLinkWalletMessage(accountId: string, address: string, nonce: string): string {
  return [
    "Agentra — link EVM wallet for live signing",
    `Account: ${accountId}`,
    `Address: ${address.toLowerCase()}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export async function createLinkChallenge(accountId: string, address: string) {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const message = buildLinkWalletMessage(accountId, address, nonce);
  return { message, nonce };
}

export async function linkEvmWallet(input: {
  accountId: string;
  address: string;
  signature: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const address = input.address.trim() as `0x${string}`;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { ok: false, error: "Invalid EVM address" };
  }

  let valid = false;
  try {
    valid = await verifyMessage({
      address,
      message: input.message,
      signature: input.signature as `0x${string}`,
    });
  } catch {
    valid = false;
  }
  if (!valid) {
    return { ok: false, error: "Signature verification failed" };
  }

  if (!input.message.includes(input.accountId) || !input.message.toLowerCase().includes(address.toLowerCase())) {
    return { ok: false, error: "Message mismatch" };
  }

  const db = getDb();
  await db
    .update(accounts)
    .set({ evmAddress: address })
    .where(eq(accounts.id, input.accountId));

  await db.insert(auditLogs).values({
    accountId: input.accountId,
    action: "evm_wallet_linked",
    metadata: { address },
  });

  return { ok: true };
}
