"use client";

import { useCallback, useEffect, useState } from "react";
import type { BotConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LiveSignPanel } from "@/components/LiveSignPanel";
import { Pause, Play, Shield, Zap } from "lucide-react";
import { useAccount } from "wagmi";

export function BotControls() {
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

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

  const toggleStatus = async () => {
    if (!bot) return;
    if (bot.status === "running") {
      await fetch("/api/v1/bot/stop", { method: "POST" });
      persist({ ...bot, status: "stopped" });
      return;
    }
    const res = await fetch("/api/v1/bot/start", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Could not start bot");
      return;
    }
    persist({ ...bot, status: "running" });
    setMsg(null);
  };

  const runTick = async () => {
    setMsg(null);
    if (bot?.mode === "live") {
      setMsg("Use Live wallet signing below to prepare and sign.");
      return;
    }
    const res = await fetch("/api/v1/bot/tick", { method: "POST" });
    const data = await res.json();
    setMsg(data.executed ? "Paper opportunity executed." : `Skipped: ${data.reason}`);
    window.location.reload();
  };

  if (loading || !bot) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-slate-500">Loading bot…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Searcher bot</h2>
            <p className="text-sm text-slate-500 capitalize">
              {bot.mode} mode · {bot.mode === "live" ? "wallet-signed txs" : "simulated ledger"}
            </p>
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
          <button type="button" onClick={runTick} disabled={bot.mode === "live"} className="flex items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 py-3 text-sm font-semibold text-teal-900 disabled:opacity-50">
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
          Live mode: you sign each tx in your wallet. Paper mode simulates fills on the internal ledger. Sandwich tactics blocked.
        </p>
      </div>

      {bot.mode === "live" && bot.status === "running" && (
        <LiveSignPanel onConfirmed={() => window.location.reload()} />
      )}
      {bot.mode === "live" && !address && (
        <p className="text-sm text-rose-700">Connect EVM wallet to sign live trades.</p>
      )}
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
