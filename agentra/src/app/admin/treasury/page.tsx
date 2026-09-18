import { CycleBanner } from "@/components/CycleBanner";
import { AdminTreasuryClient } from "@/components/AdminTreasuryClient";
import { StatCard } from "@/components/StatCard";
import { settlementTotals } from "@/lib/mock-data";
import { getAdminSettlementBatch } from "@/server/dashboard-data";
import { Banknote, Wallet } from "lucide-react";

export const metadata = {
  title: "Treasury (Admin)",
};

export default async function AdminTreasuryPage() {
  const batch = await getAdminSettlementBatch();
  const totals = settlementTotals(batch);

  return (
    <div className="space-y-6 pb-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Admin only</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Treasury · 24h USDT batch</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Verify internal ledger lines, then disburse profit withdrawals and referral license
          commissions. Connect <code className="text-xs">TRON_TREASURY_PRIVATE_KEY</code> for live
          multi-send.
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

      <AdminTreasuryClient initialLines={batch} />
    </div>
  );
}
