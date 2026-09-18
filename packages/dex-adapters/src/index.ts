/**
 * Paper DEX quote simulator (MVP) — Uniswap v3 / Sushi-style constant-product approximation.
 */

export interface DexQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountInUsdt: number;
  poolLiquidityUsdt: number;
  feeBps?: number;
}

export interface DexQuoteResult {
  amountOutUsdt: number;
  priceImpactBps: number;
  protocolFeeUsdt: number;
  venue: "uniswap_v3" | "sushiswap";
}

export function simulateCrossDexArbitrage(
  buy: DexQuoteRequest,
  sellVenue: DexQuoteResult["venue"] = "sushiswap",
): {
  buyLeg: DexQuoteResult;
  sellLeg: DexQuoteResult;
  grossUsdt: number;
  feesUsdt: number;
} {
  const buyLeg = simulateSwap({ ...buy, venue: "uniswap_v3" });
  const sellLeg = simulateSwap({
    tokenIn: buy.tokenOut,
    tokenOut: buy.tokenIn,
    amountInUsdt: buyLeg.amountOutUsdt,
    poolLiquidityUsdt: buy.poolLiquidityUsdt * 0.9,
    feeBps: buy.feeBps,
    venue: sellVenue,
  });
  const grossUsdt = sellLeg.amountOutUsdt - buy.amountInUsdt;
  const feesUsdt = buyLeg.protocolFeeUsdt + sellLeg.protocolFeeUsdt;
  return { buyLeg, sellLeg, grossUsdt, feesUsdt };
}

export function simulateSwap(
  req: DexQuoteRequest & { venue?: DexQuoteResult["venue"] },
): DexQuoteResult {
  const feeBps = req.feeBps ?? 30;
  const venue = req.venue ?? "uniswap_v3";
  const liq = Math.max(req.poolLiquidityUsdt, 1);
  const impact = Math.min(500, (req.amountInUsdt / liq) * 10_000);
  const fee = (req.amountInUsdt * feeBps) / 10_000;
  const slippage = (req.amountInUsdt * impact) / 10_000;
  const amountOutUsdt = Math.max(0, req.amountInUsdt - fee - slippage);
  return {
    amountOutUsdt,
    priceImpactBps: Math.round(impact),
    protocolFeeUsdt: fee,
    venue,
  };
}
