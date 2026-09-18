"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

type Status = {
  licenseActivated: boolean;
  stripeEnabled: boolean;
  evmLinked: boolean;
  usdtPayout: string | null;
};

export function OnboardingChecklist() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/v1/licensing/status")
      .then((r) => (r.ok ? r.json() : null))
      .then(setS);
  }, []);

  if (!s) return null;

  const steps = [
    { done: s.licenseActivated, label: "Activate license", href: "/pricing" },
    { done: Boolean(s.usdtPayout), label: "Set TRC-20 payout wallet", href: "/dashboard/settings" },
    { done: s.evmLinked, label: "Link EVM wallet (live signing)", href: "/dashboard" },
    { done: false, label: "Run paper bot → switch to live", href: "/dashboard" },
  ];

  const doneCount = steps.filter((x) => x.done).length;
  if (doneCount >= steps.length) return null;

  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 shadow-sm">
      <p className="text-sm font-semibold text-teal-900">
        Setup checklist ({doneCount}/{steps.length})
      </p>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-teal-800"
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 text-slate-400" />
              )}
              {step.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
