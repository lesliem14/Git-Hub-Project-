import type { InternalLedger } from "@/lib/types";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";
import { Lock, Shield } from "lucide-react";

export function LedgerOverview({ ledger }: { ledger: InternalLedger }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Account ledger</h2>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        Trading uses your EVM wallet plus internal balance. During an open trade (~2 hours), that
        slice is locked then released back to available.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="Available (withdrawable after cycle)" value={ledger.availableUsdt} />
        <Row label="Locked in active trade" value={ledger.lockedInTradeUsdt} highlight />
        <Row label="EVM wallet (custody — estimate)" value={ledger.evmWalletUsdtEstimate} muted />
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2">
          <dt className="flex items-center gap-1 text-xs font-medium text-amber-900">
            <Shield className="h-3.5 w-3.5" />
            License credit ({formatUsdt(LICENSE_FEE_USDT)} USDT)
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-amber-950">
            {formatUsdt(ledger.licenseCreditUsdt)} <span className="text-xs font-normal">non-withdrawable</span>
          </dd>
        </div>
        <Row label="Pending 24h payout (profit + referrals)" value={ledger.pendingWithdrawableUsdt} />
        <Row label="Performance fee (MVP accrual)" value={ledger.pendingPerformanceFeeUsdt} />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2 ${highlight ? "border border-violet-200 bg-violet-50/50" : "bg-stone-50"}`}
    >
      <dt className="flex items-center gap-1 text-xs text-slate-500">
        {highlight && <Lock className="h-3 w-3 text-violet-600" />}
        {label}
      </dt>
      <dd
        className={`mt-1 text-lg font-semibold tabular-nums ${muted ? "text-slate-600" : "text-slate-900"}`}
      >
        {formatUsdt(value)} USDT
      </dd>
    </div>
  );
}
