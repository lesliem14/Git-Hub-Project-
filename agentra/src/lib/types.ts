export type BotMode = "paper" | "live";
export type BotStatus = "running" | "stopped" | "paused";
export type RiskLevel = "conservative" | "balanced" | "aggressive";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  /** EVM address for signing live trades */
  walletAddress: string;
  /** USDT TRC-20 payout / deposit address */
  usdtPayoutWallet: string;
  licenseActivated: boolean;
  subscriptionTier: "free" | "licensed" | "pro" | "enterprise";
}

export interface InternalLedger {
  /** Spendable internal balance (deposits + settled profit, excl. license lock) */
  availableUsdt: number;
  /** $100 license — not withdrawable; counts toward trading allocation */
  licenseCreditUsdt: number;
  /** Capital currently in an open ~2h trade cycle */
  lockedInTradeUsdt: number;
  /** EVM wallet balance (read-only snapshot; user custody) */
  evmWalletUsdtEstimate: number;
  /** Accrued this cycle before 24h payout */
  pendingWithdrawableUsdt: number;
  /** MVP performance fee accrued (deducted at settlement) */
  pendingPerformanceFeeUsdt: number;
}

export interface ActiveTradeLock {
  id: string;
  amountUsdt: number;
  startedAt: string;
  releasesAt: string;
  strategy: string;
  status: "open" | "released";
}

export interface BotConfig {
  mode: BotMode;
  status: BotStatus;
  riskLevel: RiskLevel;
  maxCapitalUsdt: number;
  maxTradeSizeUsdt: number;
  maxDailyLossUsdt: number;
  minExpectedProfitUsdt: number;
}

export interface DashboardMetrics {
  portfolioUsdt: number;
  capitalAllocatedUsdt: number;
  opportunitiesDetected: number;
  tradesExecuted: number;
  grossPnlUsdt: number;
  gasCostsUsdt: number;
  protocolFeesUsdt: number;
  netPnlUsdt: number;
  failedTransactions: number;
  executionSuccessRate: number;
  avgOpportunitySizeUsdt: number;
  roiPercent: number;
  maxDrawdownPercent: number;
  riskExposureUsdt: number;
}

export interface SettlementLine {
  id: string;
  userId: string;
  displayName: string;
  usdtWalletTrc20: string;
  cycleId: string;
  cycleEndsAt: string;
  tradingNetUsdt: number;
  referralCommissionsUsdt: number;
  performanceFeeUsdt: number;
  platformFeesUsdt: number;
  adjustmentsUsdt: number;
  totalDueUsdt: number;
  status: "pending" | "processing" | "paid" | "failed";
  paidAt?: string;
  txHash?: string;
  ledgerVerified?: boolean;
}

export interface LiveProfitEvent {
  id: string;
  blurredUser: string;
  strategy: string;
  netProfitUsdt: number;
  chain: string;
  timestamp: string;
}

export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tierRequired: UserProfile["subscriptionTier"];
}

export type WalletKind = "metamask" | "trust" | "phantom" | "keplr" | "tron";
