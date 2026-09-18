"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { BotConfig } from "@/lib/types";
import { demoBot } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Pause, Play, Shield } from "lucide-react";

export function BotControls({ initial = demoBot }: { initial?: BotConfig }) {
  const [bot, setBot] = useState(initial);

  const toggleStatus = () => {
    setBot((b) => ({
      ...b,
      status: b.status === "running" ? "stopped" : "running",
    }));
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Searcher bot</h2>
          <p className="text-sm text-slate-500">
            Non-custodial · your wallet signs every live transaction
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            bot.status === "running"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              bot.status === "running" ? "bg-emerald-500 animate-pulse" : "bg-slate-400",
            )}
          />
          {bot.status === "running" ? "Running" : "Stopped"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={toggleStatus}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
            bot.status === "running"
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-teal-700 text-white hover:bg-teal-800",
          )}
        >
          {bot.status === "running" ? (
            <>
              <Pause className="h-4 w-4" /> Stop bot
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start bot
            </>
          )}
        </button>
        <div className="flex rounded-xl border border-stone-200 p-1">
          {(["paper", "live"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBot((b) => ({ ...b, mode }))}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium capitalize",
                bot.mode === mode
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-stone-50",
              )}
            >
              {mode === "paper" ? "Paper trading" : "Live trading"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Risk level">
          <select
            value={bot.riskLevel}
            onChange={(e) =>
              setBot((b) => ({
                ...b,
                riskLevel: e.target.value as BotConfig["riskLevel"],
              }))
            }
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </Field>
        <Field label="Max capital (USDT)" value={bot.maxCapitalUsdt} field="maxCapitalUsdt" setBot={setBot} />
        <Field label="Max trade size (USDT)" value={bot.maxTradeSizeUsdt} field="maxTradeSizeUsdt" setBot={setBot} />
        <Field label="Max daily loss (USDT)" value={bot.maxDailyLossUsdt} field="maxDailyLossUsdt" setBot={setBot} />
        <Field
          label="Min expected profit (USDT)"
          value={bot.minExpectedProfitUsdt}
          field="minExpectedProfitUsdt"
          setBot={setBot}
        />
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        Live mode executes only when simulated expected net profit exceeds all costs plus your
        safety buffer. Sandwich and malicious front-running strategies are blocked by policy.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  field,
  setBot,
  children,
}: {
  label: string;
  value?: number;
  field?: keyof BotConfig;
  setBot?: Dispatch<SetStateAction<BotConfig>>;
  children?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children ?? (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            field &&
            setBot?.((b) => ({ ...b, [field]: Number(e.target.value) || 0 }))
          }
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}
