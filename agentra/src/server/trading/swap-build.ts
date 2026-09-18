import { getLiveChainId } from "@/lib/live-chain";
import {
  buildLiveSwapBundle,
  getChainSwapConfig,
  type LiveSwapTx,
  type SwapStyle,
} from "@/lib/uniswap-v3-live";
import type { UnsignedLiveTransaction } from "./live-execution";

export function resolveSwapStyle(chainId: number): SwapStyle {
  const env = process.env.AGENTRA_LIVE_SWAP_STYLE?.toLowerCase();
  if (env === "wrap" || env === "uniswap") return env;
  return chainId === 11155111 ? "wrap" : "uniswap";
}

function toUnsigned(tx: LiveSwapTx, description: string): UnsignedLiveTransaction {
  return {
    chainId: tx.chainId,
    to: tx.to,
    data: tx.data,
    value: tx.value,
    gas: tx.gas,
    description,
    mode: "swap",
    label: tx.label,
  } as UnsignedLiveTransaction & { label: string };
}

export function buildSwapTransactions(input: {
  from: `0x${string}`;
  maxTradeUsdt: number;
  strategy: string;
}): {
  transactions: UnsignedLiveTransaction[];
  style: SwapStyle;
  error?: string;
} {
  const chainId = getLiveChainId();
  const cfg = getChainSwapConfig(chainId);
  if (!cfg) {
    return { transactions: [], style: "wrap", error: `No swap config for chain ${chainId}` };
  }

  const style = resolveSwapStyle(chainId);
  const bundle = buildLiveSwapBundle({
    chainId,
    recipient: input.from,
    maxTradeUsdt: input.maxTradeUsdt,
    style,
  });

  if (!bundle.length) {
    return { transactions: [], style, error: "Could not build swap calldata" };
  }

  const desc =
    style === "wrap"
      ? `Live swap (leg 1): wrap ETH → WETH on Uniswap ${chainId === 11155111 ? "Sepolia" : "mainnet"}. You send native ETH as value.`
      : `Live swap: USDC → WETH via Uniswap V3 router. Sign approve, then swap (${input.strategy}).`;

  return {
    style,
    transactions: bundle.map((tx, i) =>
      toUnsigned(
        tx,
        bundle.length > 1 ? `${desc} (step ${i + 1}/${bundle.length})` : desc,
      ),
    ),
  };
}

export function allowedSwapTargets(chainId: number): Set<string> {
  const cfg = getChainSwapConfig(chainId);
  if (!cfg) return new Set();
  return new Set(
    [cfg.swapRouter, cfg.weth, cfg.usdc].map((a) => a.toLowerCase()),
  );
}
