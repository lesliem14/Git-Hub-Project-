"use client";

import { useEffect, useState } from "react";
import type { LiveProfitEvent } from "@/lib/types";
import { formatUsdt } from "@/lib/utils";

export function ProfitTicker() {
  const [events, setEvents] = useState<LiveProfitEvent[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetch("/api/live-feed");
      const data = (await res.json()) as LiveProfitEvent[];
      if (mounted) setEvents(data);
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const track = [...events, ...events];

  return (
    <div
      className="sticky bottom-0 z-30 border-t border-teal-900/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white"
      aria-label="Live community profit stream"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-6">
        <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:text-xs">
          Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-8 whitespace-nowrap py-1 text-xs sm:text-sm">
            {track.map((e, i) => (
              <span key={`${e.id}-${i}`} className="inline-flex items-center gap-2">
                <span className="font-medium text-slate-300">{e.blurredUser}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{e.strategy}</span>
                <span className="font-semibold text-emerald-400">
                  +{formatUsdt(e.netProfitUsdt)} USDT
                </span>
                <span className="hidden text-slate-500 sm:inline">({e.chain})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
