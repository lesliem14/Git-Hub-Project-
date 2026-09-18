"use client";

import { useEffect, useState } from "react";
import type { LiveProfitEvent } from "@/lib/types";
import { formatUsdt } from "@/lib/utils";
import { Radio } from "lucide-react";

export function LiveFeedPanel() {
  const [events, setEvents] = useState<LiveProfitEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/live-feed");
      if (!res.ok) return;
      const data = (await res.json()) as { events: LiveProfitEvent[] };
      if (!cancelled) setEvents(data.events ?? []);
    };
    load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Radio className="h-5 w-5 text-teal-700" />
        Live pipeline
      </h2>
      <p className="mt-1 text-xs text-slate-500">Recent detections & paper fills (polls every 8s)</p>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {events.length === 0 && (
          <li className="text-sm text-slate-500">Start the bot and run a cycle to populate feed.</li>
        )}
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium text-slate-900">{e.strategy}</span>
              <span className="ml-2 text-xs text-slate-500">{e.blurredUser}</span>
            </div>
            <span
              className={`tabular-nums font-semibold ${e.netProfitUsdt >= 0 ? "text-emerald-700" : "text-rose-700"}`}
            >
              {e.netProfitUsdt >= 0 ? "+" : ""}
              {formatUsdt(e.netProfitUsdt)} USDT
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
