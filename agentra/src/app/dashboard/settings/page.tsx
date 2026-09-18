"use client";

import { useEffect, useState } from "react";
import { isValidTrc20Address } from "@/lib/tron-utils";

export default function SettingsPage() {
  const [wallet, setWallet] = useState("");
  const [referral, setReferral] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.usdtPayoutTrc20) setWallet(d.usdtPayoutTrc20);
        if (d?.user?.username) setReferral(`AGT-${d.user.username}`);
      });
  }, []);

  const save = async () => {
    setMsg(null);
    if (!isValidTrc20Address(wallet)) {
      setMsg("Invalid TRC-20 address");
      return;
    }
    const res = await fetch("/api/v1/account/payout-wallet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: wallet }),
    });
    setMsg(res.ok ? "Payout wallet saved." : "Save failed");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          USDT TRC-20 payout wallet (24h settlements)
          <input value={wallet} onChange={(e) => setWallet(e.target.value.trim())} className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm" placeholder="T..." />
        </label>
        <button type="button" onClick={save} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Save</button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <p className="text-xs text-slate-500">Referral code prefix: {referral || "—"} (full code in Referrals page)</p>
      </div>
    </div>
  );
}
