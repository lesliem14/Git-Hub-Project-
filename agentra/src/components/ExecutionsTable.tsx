"use client";

import { useEffect, useState } from "react";
import { formatUsdt } from "@/lib/utils";

type Row = {
  id: string;
  strategy: string;
  netUsdt: string | null;
  status: string;
  mode: string;
  createdAt: string;
};

export function ExecutionsTable() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/v1/executions?limit=15")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setRows(d.items ?? []));
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Recent executions</h2>
        <a
          href="/api/v1/analytics/export"
          className="text-xs font-semibold text-teal-700 hover:underline"
        >
          Export CSV
        </a>
      </div>
      <table className="mt-3 w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Strategy</th>
            <th className="py-2">Net</th>
            <th className="py-2">Status</th>
            <th className="py-2">Mode</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="py-2 font-medium">{r.strategy}</td>
              <td className="py-2 tabular-nums">{formatUsdt(parseFloat(r.netUsdt ?? "0"))}</td>
              <td className="py-2 capitalize">{r.status}</td>
              <td className="py-2 capitalize">{r.mode}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-slate-500">
                No executions yet — start the bot and run a cycle.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
