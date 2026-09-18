"use client";

import { useCallback, useEffect, useState } from "react";
import type { BotConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Pause, Play, Shield, Zap } from "lucide-react";

export function BotControls() {
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/bot");
    if (res.ok) {
      const data = await res.json();
      setBot(data.config);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next: BotConfig) => {
    setBot(next);
    await fetch("/api/v1/bot", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  };

  const toggleStatus = () => {
    if (!bot) return;
    persist({ ...bot, status: bot.status === "running" ? "stopped" : "running" });
  };

  const runTick = async () => {
    setMsg(null);
    const res = await fetch("/api/v1/bot/tick", { method: "POST" });
    const data = await res.json();
    setMsg(data.executed ? "Paper opportunity executed." : `Skipped: ${data.reason}`);
    window.location.reload();
  };

  if (loading || !bot) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-slate-500">Loading bot…</div>;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Searcher bot</h2>
          <p className="text-sm text-slate-500">Paper mode · DEX arb pipeline (MVP)</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            bot.status === "running" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600",
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", bot.status === "running" ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
          {bot.status === "running" ? "Running" : "Stopped"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={toggleStatus} className={cn("flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold", bot.status === "running" ? "bg-slate-900 text-white" : "bg-teal-700 text-white")}>
          {bot.status === "running" ? <><Pause className="h-4 w-4" /> Stop</> : <><Play className="h-4 w-4" /> Start</>}
        </button>
        <div className="flex rounded-xl border border-stone-200 p-1">
          {(["paper", "live"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => persist({ ...bot, mode })} className={cn("flex-1 rounded-lg py-2.5 text-sm font-medium capitalize", bot.mode === mode ? "bg-teal-700 text-white" : "text-slate-600")}>
              {mode}
            </button>
          ))}
        </div>
        <button type="button" onClick={runTick} className="flex items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 py-3 text-sm font-semibold text-teal-900">
          <Zap className="h-4 w-4" /> Run cycle now
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Risk level">
          <select value={bot.riskLevel} onChange={(e) => persist({ ...bot, riskLevel: e.target.value as BotConfig["riskLevel"] })} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm">
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </Field>
        <NumField label="Max capital (USDT)" value={bot.maxCapitalUsdt} onChange={(v) => persist({ ...bot, maxCapitalUsdt: v })} />
        <NumField label="Max trade (USDT)" value={bot.maxTradeSizeUsdt} onChange={(v) => persist({ ...bot, maxTradeSizeUsdt: v })} />
        <NumField label="Max daily loss" value={bot.maxDailyLossUsdt} onChange={(v) => persist({ ...bot, maxDailyLossUsdt: v })} />
        <NumField label="Min expected profit" value={bot.minExpectedProfitUsdt} onChange={(v) => persist({ ...bot, minExpectedProfitUsdt: v })} />
      </div>

      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        Executes only when expected net &gt; costs + your buffer. Live mode requires wallet signing (post-MVP). Sandwich tactics blocked.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-slate-500">{label}</span><div className="mt-1">{children}</div></label>;
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
    </Field>
  );
}
