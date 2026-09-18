import { sepolia, mainnet } from "viem/chains";

export type LiveTxMode = "probe" | "swap";

export function getLiveChainId(): number {
  const raw = process.env.AGENTRA_LIVE_CHAIN_ID ?? "11155111";
  return parseInt(raw, 10);
}

export function getLiveTxMode(): LiveTxMode {
  const m = process.env.AGENTRA_LIVE_TX_MODE ?? "probe";
  return m === "swap" ? "swap" : "probe";
}

export function getLiveChainMeta(chainId: number) {
  if (chainId === mainnet.id) {
    return { name: "Ethereum", explorer: "https://etherscan.io", chain: mainnet };
  }
  if (chainId === sepolia.id) {
    return { name: "Sepolia", explorer: "https://sepolia.etherscan.io", chain: sepolia };
  }
  return { name: `Chain ${chainId}`, explorer: "", chain: sepolia };
}

export function getLiveRpcUrl(chainId: number): string {
  if (chainId === mainnet.id) {
    return process.env.ETHEREUM_RPC_URL ?? "https://eth.llamarpc.com";
  }
  return process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";
}
