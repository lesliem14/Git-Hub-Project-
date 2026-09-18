import { PERFORMANCE_FEE_RATE } from "./constants";
import type { SettlementLine } from "./types";

/**
 * Payout formula:
 *   total = tradingNet + referralCommissionsFromDownline − performanceFee − platformFees + adjustments
 *
 * Performance fee (10% MVP) applies **only** to the user's own positive trading net — not to
 * referral license commissions earned from their downline.
 */
export function computeSettlementTotal(line: Omit<SettlementLine, "totalDueUsdt" | "id">): number {
  const performanceFee = computePerformanceFeeOnTradingProfit(line.tradingNetUsdt);
  const afterFees =
    line.tradingNetUsdt +
    line.referralCommissionsUsdt -
    performanceFee -
    line.platformFeesUsdt +
    line.adjustmentsUsdt;
  return Math.max(0, Math.round(afterFees * 100) / 100);
}

/** 10% on own trading profit only; zero if no positive trading net. */
export function computePerformanceFeeOnTradingProfit(tradingNetUsdt: number): number {
  if (tradingNetUsdt <= 0) return 0;
  return Math.round(tradingNetUsdt * PERFORMANCE_FEE_RATE * 100) / 100;
}

/** @deprecated use computePerformanceFeeOnTradingProfit */
export const computePerformanceFee = computePerformanceFeeOnTradingProfit;

export function verifySettlementAgainstLedger(
  line: SettlementLine,
  ledgerAvailable: number,
): { ok: boolean; message: string } {
  const expectedPerf = computePerformanceFeeOnTradingProfit(line.tradingNetUsdt);
  const expected = computeSettlementTotal({ ...line, performanceFeeUsdt: expectedPerf });
  if (Math.abs(expectedPerf - line.performanceFeeUsdt) > 0.02) {
    return { ok: false, message: "Performance fee must apply to trading profit only." };
  }
  if (Math.abs(expected - line.totalDueUsdt) > 0.02) {
    return { ok: false, message: "Line total does not match ledger formula." };
  }
  if (line.tradingNetUsdt > 0 && line.tradingNetUsdt > ledgerAvailable + line.tradingNetUsdt) {
    return { ok: false, message: "Trading net exceeds ledger bounds." };
  }
  if (line.totalDueUsdt < 0) {
    return { ok: false, message: "Negative payout blocked." };
  }
  return { ok: true, message: "Ledger reconciled." };
}
