import { botConfigs } from "../../../drizzle/schema";
import { simulateCrossDexArbitrage } from "@agentra/dex-adapters";
import { estimateSwapGas } from "@agentra/chain-adapters";
import { scoreOpportunity } from "./risk-engine";

export function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

export type BotRow = typeof botConfigs.$inferSelect;

export async function randomOpportunity() {
  const tradeIn = Math.round((Math.random() * 500 + 50) * 100) / 100;
  const poolDepthUsdt = Math.round(Math.random() * 500000 + 50000);
  const sim = simulateCrossDexArbitrage({
    tokenIn: "USDT",
    tokenOut: "WETH",
    amountInUsdt: tradeIn,
    poolLiquidityUsdt: poolDepthUsdt,
  });
  const gasEst = await estimateSwapGas(1, "multi-hop");
  const gross = Math.round(sim.grossUsdt * 100) / 100;
  const gas = Math.round(gasEst.costUsdt * 100) / 100;
  const fees = Math.round(sim.feesUsdt * 100) / 100;
  const net = Math.round((gross - gas - fees) * 100) / 100;
  const strategies = ["DEX Arbitrage", "Cross-DEX", "Liquidation"] as const;
  return {
    strategy: strategies[Math.floor(Math.random() * strategies.length)],
    grossUsdt: gross,
    gasUsdt: gas,
    feesUsdt: fees,
    netUsdt: net,
    poolDepthUsdt,
  };
}

export async function evaluateOpportunity(bot: BotRow) {
  const opp = await randomOpportunity();
  const minProfit = num(bot.minExpectedProfitUsdt);
  const maxTrade = num(bot.maxTradeSizeUsdt);
  const score = scoreOpportunity({
    netUsdt: opp.netUsdt,
    minExpectedProfitUsdt: minProfit,
    poolDepthUsdt: opp.poolDepthUsdt,
    maxTradeSizeUsdt: maxTrade,
  });
  const shouldExecute = score.shouldExecute && opp.netUsdt > minProfit;
  return { opp, score, shouldExecute, reason: shouldExecute ? "ok" : score.reason };
}
