import { CycleBanner } from "@/components/CycleBanner";
import { SettlementTable } from "@/components/SettlementTable";
import { StatCard } from "@/components/StatCard";
import { settlementBatch, settlementTotals } from "@/lib/mock-data";
import { formatUsdt } from "@/lib/utils";
import { Banknote, Users, Wallet } from "lucide-react";

export const metadata = {
  title: "24h USDT Settlements",
};

export default function SettlementsPage() {
  const totals = settlementTotals(settlementBatch);

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          24-hour USDT settlements
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          At the end of each UTC day, Agentra calculates what must be sent to each user&apos;s
          registered <strong>USDT TRC-20</strong> wallet: trading net P&amp;L (when your plan
          includes profit settlement), referral commissions, minus subscription or platform fees.
          This view is for treasury operators and verified account owners.
        </p>
      </header>

      <CycleBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total USDT due (cycle)"
          value={totals.totalDue}
          suffix="USDT"
          tone="positive"
          icon={Banknote}
          sub="Sum of all wallet lines below"
        />
        <StatCard
          label="Still pending payout"
          value={totals.pending}
          suffix="USDT"
          icon={Wallet}
        />
        <StatCard
          label="Wallets in batch"
          value={totals.wallets}
          suffix=""
          icon={Users}
        />
        <StatCard
          label="Referral commissions"
          value={totals.referrals}
          suffix="USDT"
          tone="muted"
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Payout queue</h2>
          <p className="text-xs text-slate-500">
            Trading net: {formatUsdt(totals.tradingNet)} · Fees collected:{" "}
            {formatUsdt(totals.fees)} USDT
          </p>
        </div>
        <SettlementTable lines={settlementBatch} />
      </div>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
        <p className="font-semibold text-slate-800">Settlement formula (per wallet)</p>
        <p className="mt-2 font-mono text-[11px] sm:text-xs">
          total_due = trading_net + referral_commissions − platform_fees + adjustments
        </p>
        <p className="mt-2">
          <strong>A — Technical:</strong> Batch generation, Tron USDT transfers, and on-chain
          reconciliation are automatable. <strong>B — Economic:</strong> Viability depends on
          actual net strategy results minus gas; many cycles may be zero or negative.{" "}
          <strong>C — Safe:</strong> Payouts should never exceed verified ledger balances.{" "}
          <strong>D — Testing:</strong> Run paper mode + internal treasury dry-runs before mainnet
          disbursement. <strong>E — Compliance:</strong> Money transmission, tax reporting, and
          regional licensing may apply if you custody or route user funds—Agentra&apos;s default
          model keeps trading non-custodial and treats subscriptions as software fees.
        </p>
      </section>
    </div>
  );
}
