"use client";

import { useEffect, useState } from "react";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

type ReferralData = {
  referralCode: string | null;
  directReferrals: number;
  totalCommissionsUsdt: number;
  recentReferrals: { username: string; licenseActivated: boolean; joinedAt: string }[];
  recentCommissions: { level: number; commissionUsdt: number; createdAt: string }[];
};

export function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [origin, setOrigin] = useState("https://app.agentra.network");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/v1/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);
  }, []);

  if (!data) {
    return <p className="text-sm text-slate-500">Loading referral stats…</p>;
  }

  const link = data.referralCode ? `${origin}/r/${data.referralCode}` : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Your link</p>
        <p className="mt-2 break-all font-mono text-sm text-teal-800">{link}</p>
        <p className="mt-2 text-xs text-slate-500">
          Direct referrals: <strong>{data.directReferrals}</strong> · Commissions earned:{" "}
          <strong>{formatUsdt(data.totalCommissionsUsdt)} USDT</strong> (license fees only)
        </p>
      </div>

      {data.recentReferrals.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Recent sign-ups</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {data.recentReferrals.map((r) => (
              <li key={r.joinedAt + r.username} className="flex justify-between text-slate-600">
                <span>{r.username}</span>
                <span>{r.licenseActivated ? "Licensed" : "Pending"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Example L1 commission per {formatUsdt(LICENSE_FEE_USDT)} license:{" "}
        {formatUsdt(LICENSE_FEE_USDT * 0.15)} USDT — not guaranteed income.
      </p>
    </div>
  );
}
