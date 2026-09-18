import { cn, formatUsdt } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  suffix,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative" | "muted";
}) {
  const display =
    typeof value === "number" && suffix === "USDT"
      ? formatUsdt(value)
      : typeof value === "number" && suffix === "%"
        ? value.toFixed(2)
        : value;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-teal-600" aria-hidden />}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          tone === "positive" && "text-emerald-700",
          tone === "negative" && "text-rose-700",
          tone === "muted" && "text-slate-600",
          tone === "default" && "text-slate-900",
        )}
      >
        {display}
        {suffix && suffix !== "USDT" && (
          <span className="ml-1 text-base font-medium text-slate-500">{suffix}</span>
        )}
        {suffix === "USDT" && (
          <span className="ml-1 text-sm font-medium text-slate-500">USDT</span>
        )}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
