export type BotMode = "paper" | "live";
export type BotStatus = "running" | "stopped" | "paused";
export type RiskLevel = "conservative" | "balanced" | "aggressive";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  usdtPayoutWallet: string;
  subscriptionTier: "free" | "basic" | "pro" | "enterprise";
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
  platformFeesUsdt: number;
  adjustmentsUsdt: number;
  totalDueUsdt: number;
  status: "pending" | "processing" | "paid" | "failed";
  paidAt?: string;
  txHash?: string;
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
