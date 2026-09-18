import Link from "next/link";
import { BotControls } from "@/components/BotControls";
import { CycleBanner } from "@/components/CycleBanner";
import { StatCard } from "@/components/StatCard";
import { demoMetrics, demoUser, strategies } from "@/lib/mock-data";
import { formatUsdt, truncateAddress } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  Coins,
  Gauge,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const m = demoMetrics;

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Welcome back, {demoUser.username} · {demoUser.subscriptionTier.toUpperCase()} license
          </p>
        </div>
        <Link
          href="/dashboard/settlements"
          className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-100"
        >
          View 24h USDT settlements →
        </Link>
      </header>

      <CycleBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio" value={m.portfolioUsdt} suffix="USDT" icon={Wallet} />
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

      <BotControls />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Performance breakdown</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            {[
              ["Capital allocated", formatUsdt(m.capitalAllocatedUsdt) + " USDT"],
              ["Opportunities detected", m.opportunitiesDetected.toString()],
              ["Trades executed", m.tradesExecuted.toString()],
              ["Gross P&L", formatUsdt(m.grossPnlUsdt) + " USDT"],
              ["Gas costs", "−" + formatUsdt(m.gasCostsUsdt)],
              ["Protocol fees", "−" + formatUsdt(m.protocolFeesUsdt)],
              ["Failed txs", m.failedTransactions.toString()],
              ["Avg opportunity", formatUsdt(m.avgOpportunitySizeUsdt) + " USDT"],
              ["ROI (cycle)", m.roiPercent.toFixed(2) + "%"],
              ["Risk exposure", formatUsdt(m.riskExposureUsdt) + " USDT"],
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

      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Coins className="h-4 w-4 text-teal-700" />
          Connected wallets
        </h2>
        <p className="mt-2 text-slate-600">
          EVM signing:{" "}
          <span className="font-mono text-slate-900">
            {truncateAddress(demoUser.walletAddress, 6)}
          </span>
        </p>
        <p className="mt-1 text-slate-600">
          USDT payout (TRC-20):{" "}
          <span className="font-mono text-slate-900">
            {truncateAddress(demoUser.usdtPayoutWallet, 6)}
          </span>
        </p>
        <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <Gauge className="mt-0.5 h-3.5 w-3.5" />
          Settlement totals for this cycle appear on the 24h Settlements page when the UTC window
          closes.
        </p>
      </div>
    </div>
  );
}
