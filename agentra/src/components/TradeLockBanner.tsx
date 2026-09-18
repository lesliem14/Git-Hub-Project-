"use client";

import { useEffect, useState } from "react";
import type { ActiveTradeLock } from "@/lib/types";
import { TRADE_LOCK_HOURS } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";
import { Timer } from "lucide-react";

function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

export function TradeLockBanner({ trade }: { trade: ActiveTradeLock }) {
  const [remaining, setRemaining] = useState(
    () => new Date(trade.releasesAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(trade.releasesAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [trade.releasesAt]);

  const released = remaining <= 0;

  return (
    <div
      className={`rounded-2xl border px-4 py-4 sm:px-5 ${
        released
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-violet-200 bg-violet-50/60"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Timer className={`mt-0.5 h-5 w-5 ${released ? "text-emerald-700" : "text-violet-700"}`} />
          <div>
            <p className="font-semibold text-slate-900">
              {released ? "Trade cycle complete — funds released" : "Funds in active trade"}
            </p>
            <p className="text-sm text-slate-600">
              {formatUsdt(trade.amountUsdt)} USDT · {trade.strategy} · {TRADE_LOCK_HOURS}h window
            </p>
          </div>
        </div>
        {!released && (
          <p className="font-mono text-sm font-semibold text-violet-900">
            Releases in {formatRemaining(remaining)}
          </p>
        )}
      </div>
    </div>
  );
}
