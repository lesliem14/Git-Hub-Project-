"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getCurrentCycle } from "@/lib/cycle";

export function CycleBanner() {
  const [cycle, setCycle] = useState(getCurrentCycle());

  useEffect(() => {
    const id = setInterval(() => setCycle(getCurrentCycle()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            24-hour settlement cycle
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Cycle <span className="font-mono font-medium text-slate-900">{cycle.cycleId}</span>{" "}
            (UTC). USDT TRC-20 payouts are calculated when this window closes.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-500">Time remaining</p>
          <p className="font-mono text-lg font-semibold text-slate-900">
            {formatCountdown(cycle.remainingMs)}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-1000"
          style={{ width: `${Math.min(100, cycle.progressPercent)}%` }}
        />
      </div>
    </div>
  );
}
