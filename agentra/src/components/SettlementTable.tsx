"use client";

import { useMemo, useState } from "react";
import type { SettlementLine } from "@/lib/types";
import { formatUsdt, truncateAddress } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

export function SettlementTable({ lines }: { lines: SettlementLine[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return lines;
    if (filter === "pending")
      return lines.filter((l) => l.status === "pending" || l.status === "processing");
    return lines.filter((l) => l.status === "paid");
  }, [lines, filter]);

  const copyWallet = async (wallet: string) => {
    await navigator.clipboard.writeText(wallet);
    setCopied(wallet);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "paid"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-stone-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">USDT wallet (TRC-20)</th>
              <th className="px-4 py-3 font-semibold text-right">Trading net</th>
              <th className="px-4 py-3 font-semibold text-right">Referrals</th>
              <th className="px-4 py-3 font-semibold text-right">Fees</th>
              <th className="px-4 py-3 font-semibold text-right">Total due</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((line) => (
              <tr key={line.id} className="hover:bg-stone-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{line.displayName}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => copyWallet(line.usdtWalletTrc20)}
                    className="inline-flex items-center gap-1 font-mono text-xs text-teal-800 hover:underline"
                  >
                    {truncateAddress(line.usdtWalletTrc20, 6)}
                    {copied === line.usdtWalletTrc20 ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatUsdt(line.tradingNetUsdt)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700">
                  {formatUsdt(line.referralCommissionsUsdt)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  −{formatUsdt(line.platformFeesUsdt)}
                </td>
                <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-slate-900">
                  {formatUsdt(line.totalDueUsdt)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={line.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((line) => (
          <article
            key={line.id}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{line.displayName}</p>
                <button
                  type="button"
                  onClick={() => copyWallet(line.usdtWalletTrc20)}
                  className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-teal-800"
                >
                  {truncateAddress(line.usdtWalletTrc20, 8)}
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <StatusBadge status={line.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-slate-500">Trading net</dt>
                <dd className="font-medium tabular-nums">{formatUsdt(line.tradingNetUsdt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Referrals</dt>
                <dd className="font-medium tabular-nums text-emerald-700">
                  {formatUsdt(line.referralCommissionsUsdt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Platform fees</dt>
                <dd className="font-medium tabular-nums">−{formatUsdt(line.platformFeesUsdt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total USDT due</dt>
                <dd className="text-sm font-bold tabular-nums">{formatUsdt(line.totalDueUsdt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SettlementLine["status"] }) {
  const styles = {
    pending: "bg-amber-100 text-amber-900",
    processing: "bg-blue-100 text-blue-900",
    paid: "bg-emerald-100 text-emerald-900",
    failed: "bg-rose-100 text-rose-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
