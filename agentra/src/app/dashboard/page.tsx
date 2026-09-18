import { BotControls } from "@/components/BotControls";
import { CycleBanner } from "@/components/CycleBanner";
import { LedgerOverview } from "@/components/LedgerOverview";
import { StatCard } from "@/components/StatCard";
import { TradeLockBanner } from "@/components/TradeLockBanner";
import { UserSettlementCard } from "@/components/UserSettlementCard";
import { WalletConnectPanel } from "@/components/WalletConnectPanel";
import {
  demoActiveTrade,
  demoLedger,
  demoMetrics,
  demoUser,
  getUserSettlement,
  strategies,
} from "@/lib/mock-data";
import { LICENSE_FEE_USDT, PERFORMANCE_FEE_RATE } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const m = demoMetrics;
  const settlement = getUserSettlement(demoUser.id);

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          {demoUser.username} · License {demoUser.licenseActivated ? "active" : "inactive"} (
          {formatUsdt(LICENSE_FEE_USDT)} USDT credit, non-withdrawable)
        </p>
      </header>

      <CycleBanner />
      <TradeLockBanner trade={demoActiveTrade} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total balance" value={m.portfolioUsdt} suffix="USDT" icon={Wallet} />
        <StatCard
          label="Net P&L (cycle)"
          value={m.netPnlUsdt}
          suffix="USDT"
          tone="positive"
          icon={TrendingUp}
        />
        <StatCard
          label="Execution success"
          value={m.executionSuccessRate}
          suffix="%"
          icon={Activity}
        />
        <StatCard
          label="Max drawdown"
          value={m.maxDrawdownPercent}
          suffix="%"
          tone="muted"
          icon={ArrowDownRight}
        />
      </div>

      <LedgerOverview ledger={demoLedger} />
      {settlement && <UserSettlementCard line={settlement} />}

      <WalletConnectPanel />
      <BotControls />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Performance breakdown</h2>
          <p className="mt-1 text-xs text-slate-500">
            MVP performance fee: {(PERFORMANCE_FEE_RATE * 100).toFixed(0)}% of positive trading
            net (shown in your settlement line).
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            {[
              ["Capital allocated", formatUsdt(m.capitalAllocatedUsdt) + " USDT"],
              ["Locked in trade", formatUsdt(demoLedger.lockedInTradeUsdt) + " USDT"],
              ["Opportunities detected", m.opportunitiesDetected.toString()],
              ["Trades executed", m.tradesExecuted.toString()],
              ["Gross P&L", formatUsdt(m.grossPnlUsdt) + " USDT"],
              ["Gas costs", "−" + formatUsdt(m.gasCostsUsdt)],
              ["Protocol fees", "−" + formatUsdt(m.protocolFeesUsdt)],
              ["Failed txs", m.failedTransactions.toString()],
              ["ROI (cycle)", m.roiPercent.toFixed(2) + "%"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium tabular-nums text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target className="h-5 w-5 text-teal-700" />
            Strategies
          </h2>
          <ul className="mt-3 space-y-2">
            {strategies.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span
                    className={`text-xs font-semibold ${s.enabled ? "text-emerald-700" : "text-slate-400"}`}
                  >
                    {s.enabled ? "On" : "Off"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
