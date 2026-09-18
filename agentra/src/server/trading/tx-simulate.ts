import { createPublicClient, http } from "viem";
import { getLiveChainId, getLiveRpcUrl } from "@/lib/live-chain";
import type { UnsignedLiveTransaction } from "./live-execution";

export async function simulateUnsignedTransaction(
  from: `0x${string}`,
  tx: UnsignedLiveTransaction,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const chainId = getLiveChainId();
  if (tx.chainId !== chainId) {
    return { ok: false, error: `Transaction chain ${tx.chainId} does not match AGENTRA_LIVE_CHAIN_ID` };
  }

  const client = createPublicClient({ transport: http(getLiveRpcUrl(chainId)) });

  try {
    await client.call({
      account: from,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Simulation reverted";
    if (msg.toLowerCase().includes("insufficient funds")) {
      return { ok: false, error: "Simulation failed: insufficient ETH for gas or tx value" };
    }
    return { ok: false, error: `Simulation failed: ${msg.slice(0, 200)}` };
  }
}
