"use client";

import { useMemo, useState } from "react";
import type { SettlementLine } from "@/lib/types";
import { formatUsdt, truncateAddress } from "@/lib/utils";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export function AdminTreasuryClient({ initialLines }: { initialLines: SettlementLine[] }) {
  const [lines, setLines] = useState(initialLines);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pendingLines = useMemo(
    () => lines.filter((l) => l.status === "pending" || l.status === "processing"),
    [lines],
  );

  const selectedTotal = useMemo(
    () =>
      lines
        .filter((l) => selected.has(l.id))
        .reduce((s, l) => s + l.totalDueUsdt, 0),
    [lines, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === pendingLines.length) setSelected(new Set());
    else setSelected(new Set(pendingLines.map((l) => l.id)));
  };

  const verifyLedger = async () => {
    setBusy("verify");
    setMessage(null);
    const res = await fetch("/api/admin/treasury/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    const data = await res.json();
    setLines((prev) =>
      prev.map((l) =>
        data.verifiedIds?.includes(l.id) ? { ...l, ledgerVerified: true } : l,
      ),
    );
    setMessage(data.message ?? "Ledger verification complete.");
    setBusy(null);
  };

  const paySelected = async () => {
    setBusy("pay");
    setMessage(null);
    const res = await fetch("/api/admin/treasury/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    const data = await res.json();
    if (data.updated) {
      setLines(data.updated as SettlementLine[]);
    }
    setMessage(data.message ?? "Payout batch submitted.");
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bulk TRC-20 disbursement</p>
          <p className="text-xs text-slate-500">
            Verify internal ledger, then pay multiple wallets in one batch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={selected.size === 0 || busy !== null}
            onClick={verifyLedger}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 disabled:opacity-50"
          >
            {busy === "verify" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Verify ledger
          </button>
          <button
            type="button"
            disabled={selected.size === 0 || busy !== null}
            onClick={paySelected}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "pay" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Pay selected ({formatUsdt(selectedTotal)} USDT)
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">{message}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === pendingLines.length && pendingLines.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all pending"
                  />
                </th>
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">TRC-20 wallet</th>
                <th className="px-3 py-3 text-right">Total due</th>
                <th className="px-3 py-3">Verified</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lines.map((line) => (
                <tr key={line.id} className={selected.has(line.id) ? "bg-teal-50/40" : ""}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(line.id)}
                      onChange={() => toggle(line.id)}
                      disabled={line.status === "paid"}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{line.displayName}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {truncateAddress(line.usdtWalletTrc20, 8)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {formatUsdt(line.totalDueUsdt)}
                  </td>
                  <td className="px-3 py-2">
                    {line.ledgerVerified ? (
                      <span className="text-xs font-semibold text-emerald-700">Yes</span>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 capitalize text-xs">{line.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
