/** Ethereum RPC adapter (MVP stub — paper mode does not broadcast). */

export interface GasEstimate {
  gasUnits: bigint;
  gasPriceGwei: number;
  costEth: number;
  costUsdt: number;
}

const ETH_USD = 3500;

export async function estimateSwapGas(
  _chainId = 1,
  complexity: "simple" | "multi-hop" = "simple",
): Promise<GasEstimate> {
  const gasUnits = BigInt(complexity === "multi-hop" ? 320_000 : 180_000);
  const gasPriceGwei = 25 + Math.random() * 40;
  const costEth = (Number(gasUnits) * gasPriceGwei) / 1e9;
  return {
    gasUnits,
    gasPriceGwei,
    costEth,
    costUsdt: costEth * ETH_USD,
  };
}

export function getRpcUrl(chainId = 1): string {
  if (chainId === 1) {
    return process.env.ETHEREUM_RPC_URL ?? "https://eth.llamarpc.com";
  }
  return process.env.ETHEREUM_RPC_URL ?? "https://eth.llamarpc.com";
}
