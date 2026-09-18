import { CycleBanner } from "@/components/CycleBanner";
import { AdminTreasuryClient } from "@/components/AdminTreasuryClient";
import { StatCard } from "@/components/StatCard";
import { settlementBatch, settlementTotals } from "@/lib/mock-data";
import { Banknote, Wallet } from "lucide-react";

export const metadata = {
  title: "Treasury (Admin)",
};

export default function AdminTreasuryPage() {
  const totals = settlementTotals(settlementBatch);

  return (
    <div className="space-y-6 pb-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Admin only</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Treasury · 24h USDT batch</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Verify internal ledger lines, then disburse <strong>profit withdrawals</strong> and{" "}
          <strong>referral license commissions</strong> to each user&apos;s TRC-20 wallet. Performance
          fees are deducted before payout.
        </p>
      </header>

      <CycleBanner />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Batch total due"
          value={totals.totalDue}
          suffix="USDT"
          icon={Banknote}
        />
        <StatCard label="Pending" value={totals.pending} suffix="USDT" icon={Wallet} />
      </div>

      <AdminTreasuryClient initialLines={settlementBatch} />
    </div>
  );
}
