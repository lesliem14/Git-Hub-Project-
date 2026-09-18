/** AI/risk filter MVP: execute probability from opportunity economics (not price direction). */
export function scoreOpportunity(input: {
  netUsdt: number;
  minExpectedProfitUsdt: number;
  poolDepthUsdt: number;
  maxTradeSizeUsdt: number;
}): { shouldExecute: boolean; probability: number; reason: string } {
  if (input.netUsdt <= 0) {
    return { shouldExecute: false, probability: 0.05, reason: "negative expected net" };
  }
  if (input.netUsdt < input.minExpectedProfitUsdt) {
    return { shouldExecute: false, probability: 0.2, reason: "below min expected profit" };
  }
  const depthFactor = Math.min(1, input.poolDepthUsdt / 200000);
  const sizeFactor = Math.min(1, input.maxTradeSizeUsdt / 500);
  const profitFactor = Math.min(1, input.netUsdt / (input.minExpectedProfitUsdt * 3));
  const probability = Math.round((0.35 + depthFactor * 0.25 + sizeFactor * 0.2 + profitFactor * 0.2) * 10000) / 10000;
  const shouldExecute = probability >= 0.55 && input.netUsdt >= input.minExpectedProfitUsdt;
  return {
    shouldExecute,
    probability,
    reason: shouldExecute ? "passed risk filter" : "risk score too low",
  };
}
