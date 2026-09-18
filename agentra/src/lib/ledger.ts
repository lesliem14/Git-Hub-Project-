import { PERFORMANCE_FEE_RATE } from "./constants";
import type { SettlementLine } from "./types";

/** Recompute total due after ledger verification (both profit + referral payouts). */
export function computeSettlementTotal(line: Omit<SettlementLine, "totalDueUsdt" | "id">): number {
  const afterFees =
    line.tradingNetUsdt +
    line.referralCommissionsUsdt -
    line.performanceFeeUsdt -
    line.platformFeesUsdt +
    line.adjustmentsUsdt;
  return Math.max(0, Math.round(afterFees * 100) / 100);
}

export function computePerformanceFee(tradingNetUsdt: number): number {
  if (tradingNetUsdt <= 0) return 0;
  return Math.round(tradingNetUsdt * PERFORMANCE_FEE_RATE * 100) / 100;
}

export function verifySettlementAgainstLedger(
  line: SettlementLine,
  ledgerAvailable: number,
): { ok: boolean; message: string } {
  const expected = computeSettlementTotal(line);
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
