import type { SettlementLine } from "@/lib/types";
import { formatUsdt, truncateAddress } from "@/lib/utils";
import { Banknote } from "lucide-react";

export function UserSettlementCard({ line }: { line: SettlementLine }) {
  return (
    <section
      id="settlement"
      className="rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Banknote className="h-5 w-5 text-teal-700" />
        Your 24h USDT settlement
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Cycle <span className="font-mono">{line.cycleId}</span> · paid to your TRC-20 wallet when
        the UTC window closes. Referral amounts are license commissions from your downline;
        the 10% performance fee applies only to your own trading profit (when positive).
      </p>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <Item label="Trading net (internal ledger)" value={line.tradingNetUsdt} />
        <Item label="Referral (license commissions)" value={line.referralCommissionsUsdt} positive />
        <Item
          label="Performance fee (10% on your trading profit only)"
          value={-line.performanceFeeUsdt}
        />
        <Item label="Platform fees" value={-line.platformFeesUsdt} />
      </dl>

      <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total USDT due to you</p>
          <p className="text-2xl font-bold tabular-nums text-teal-800">
            {formatUsdt(line.totalDueUsdt)} USDT
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {truncateAddress(line.usdtWalletTrc20, 10)}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            line.status === "paid"
              ? "bg-emerald-100 text-emerald-800"
              : line.status === "processing"
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-900"
          }`}
        >
          {line.status}
        </span>
      </div>
    </section>
  );
}

function Item({
  label,
  value,
  positive,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  const display = value < 0 ? `−${formatUsdt(Math.abs(value))}` : formatUsdt(value);
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={`font-medium tabular-nums ${positive ? "text-emerald-700" : "text-slate-900"}`}
      >
        {display} USDT
      </dd>
    </div>
  );
}
