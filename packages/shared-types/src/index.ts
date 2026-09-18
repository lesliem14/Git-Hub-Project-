export type BotMode = "paper" | "live";
export type BotStatus = "running" | "stopped" | "paused";

export interface BotConfigDto {
  mode: BotMode;
  status: BotStatus;
  riskLevel: "conservative" | "balanced" | "aggressive";
  maxCapitalUsdt: number;
  maxTradeSizeUsdt: number;
  maxDailyLossUsdt: number;
  minExpectedProfitUsdt: number;
}

export interface OpportunityDto {
  id: string;
  strategy: string;
  expectedGrossUsdt: number;
  expectedNetUsdt: number;
  executeScore: number;
  detectedAt: string;
  chainId: number;
}

export interface ExecutionDto {
  id: string;
  strategy: string;
  mode: BotMode;
  grossUsdt: number;
  netUsdt: number;
  status: string;
  createdAt: string;
  txHash?: string | null;
}

export interface PnlAnalyticsDto {
  opportunitiesDetected: number;
  tradesExecuted: number;
  grossPnlUsdt: number;
  gasCostsUsdt: number;
  netPnlUsdt: number;
  failedTransactions: number;
  executionSuccessRate: number;
}
