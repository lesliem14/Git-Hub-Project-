import type {
  BotConfig,
  DashboardMetrics,
  LiveProfitEvent,
  SettlementLine,
  StrategyInfo,
  UserProfile,
} from "./types";
import { getCurrentCycle } from "./cycle";
import { blurUsername } from "./utils";

export const demoUser: UserProfile = {
  id: "usr_demo",
  username: "agentra_trader",
  email: "trader@example.com",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  usdtPayoutWallet: "TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n",
  subscriptionTier: "pro",
};

export const demoBot: BotConfig = {
  mode: "paper",
  status: "running",
  riskLevel: "balanced",
  maxCapitalUsdt: 5000,
  maxTradeSizeUsdt: 500,
  maxDailyLossUsdt: 150,
  minExpectedProfitUsdt: 8,
};

export const demoMetrics: DashboardMetrics = {
  portfolioUsdt: 4820.45,
  capitalAllocatedUsdt: 4200,
  opportunitiesDetected: 847,
  tradesExecuted: 62,
  grossPnlUsdt: 186.32,
  gasCostsUsdt: 41.18,
  protocolFeesUsdt: 12.04,
  netPnlUsdt: 133.1,
  failedTransactions: 7,
  executionSuccessRate: 89.9,
  avgOpportunitySizeUsdt: 74.5,
  roiPercent: 3.17,
  maxDrawdownPercent: 1.2,
  riskExposureUsdt: 890,
};

export const strategies: StrategyInfo[] = [
  {
    id: "dex-arb",
    name: "DEX Arbitrage",
    description: "Same-chain price gaps across supported pools.",
    enabled: true,
    tierRequired: "basic",
  },
  {
    id: "cross-dex",
    name: "Cross-DEX Discrepancy",
    description: "Route comparison across Uniswap, Sushi, and peers.",
    enabled: true,
    tierRequired: "basic",
  },
  {
    id: "liquidation",
    name: "Liquidation Monitor",
    description: "Health-factor breaches on allowlisted lending markets.",
    enabled: false,
    tierRequired: "pro",
  },
  {
    id: "backrun-benign",
    name: "Benign Back-Run",
    description: "Post-trade rebalancing where user harm is not expected.",
    enabled: false,
    tierRequired: "pro",
  },
];

const cycle = getCurrentCycle();

export const settlementBatch: SettlementLine[] = [
  {
    id: "stl_001",
    userId: "u1",
    displayName: "maria_k",
    usdtWalletTrc20: "TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n",
    cycleId: cycle.cycleId,
    cycleEndsAt: cycle.endsAt,
    tradingNetUsdt: 42.18,
    referralCommissionsUsdt: 6.35,
    platformFeesUsdt: 0,
    adjustmentsUsdt: 0,
    totalDueUsdt: 48.53,
    status: "pending",
  },
  {
    id: "stl_002",
    userId: "u2",
    displayName: "alex_r",
    usdtWalletTrc20: "TY7mN3pQ9wR2xK5vL8hJ1fD4cA6bE0gH9s",
    cycleId: cycle.cycleId,
    cycleEndsAt: cycle.endsAt,
    tradingNetUsdt: 128.9,
    referralCommissionsUsdt: 19.2,
    platformFeesUsdt: 29.0,
    adjustmentsUsdt: -2.5,
    totalDueUsdt: 116.6,
    status: "pending",
  },
  {
    id: "stl_003",
    userId: "u3",
    displayName: "sam_w",
    usdtWalletTrc20: "TZ3nM8qP1wR6xK2vL5hJ9fD0cA4bE7gH3s",
    cycleId: cycle.cycleId,
    cycleEndsAt: cycle.endsAt,
    tradingNetUsdt: 8.04,
    referralCommissionsUsdt: 0,
    platformFeesUsdt: 0,
    adjustmentsUsdt: 0,
    totalDueUsdt: 8.04,
    status: "pending",
  },
  {
    id: "stl_004",
    userId: "u4",
    displayName: "priya_n",
    usdtWalletTrc20: "TA9mK4pQ2wR8xL1vN6hJ5fD3cB0eG2hH7s",
    cycleId: cycle.cycleId,
    cycleEndsAt: cycle.endsAt,
    tradingNetUsdt: 301.55,
    referralCommissionsUsdt: 45.22,
    platformFeesUsdt: 79.0,
    adjustmentsUsdt: 0,
    totalDueUsdt: 267.77,
    status: "processing",
  },
  {
    id: "stl_005",
    userId: "u5",
    displayName: "jon_d",
    usdtWalletTrc20: "TB2mL7pQ5wR3xM9vO1hJ8fD6cC5eG4hH1s",
    cycleId: cycle.cycleId,
    cycleEndsAt: cycle.endsAt,
    tradingNetUsdt: 0,
    referralCommissionsUsdt: 12.8,
    platformFeesUsdt: 0,
    adjustmentsUsdt: 0,
    totalDueUsdt: 12.8,
    status: "pending",
  },
];

const names = [
  "nova",
  "cipher",
  "helix",
  "orbit",
  "flux",
  "aegis",
  "quant",
  "pulse",
  "vertex",
  "lumen",
];

export function generateLiveFeed(count = 12): LiveProfitEvent[] {
  const strategiesList = ["DEX Arb", "Cross-DEX", "Liquidation", "Back-run"];
  const chains = ["Ethereum", "Arbitrum", "Base"];
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length] + (i + 3);
    return {
      id: `live_${i}`,
      blurredUser: blurUsername(name),
      strategy: strategiesList[i % strategiesList.length],
      netProfitUsdt: Math.round((Math.random() * 85 + 2) * 100) / 100,
      chain: chains[i % chains.length],
      timestamp: new Date(now - i * 45000).toISOString(),
    };
  });
}

export function settlementTotals(lines: SettlementLine[]) {
  return lines.reduce(
    (acc, line) => {
      acc.totalDue += line.totalDueUsdt;
      acc.tradingNet += line.tradingNetUsdt;
      acc.referrals += line.referralCommissionsUsdt;
      acc.fees += line.platformFeesUsdt;
      acc.wallets += 1;
      if (line.status === "pending") acc.pending += line.totalDueUsdt;
      return acc;
    },
    {
      totalDue: 0,
      tradingNet: 0,
      referrals: 0,
      fees: 0,
      wallets: 0,
      pending: 0,
    },
  );
}
