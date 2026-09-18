"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Wallet } from "lucide-react";

export function PricingCheckout() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payStripe = async () => {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/v1/licensing/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error ?? "Checkout failed — sign in first");
      return;
    }
    if (data.mode === "stripe" && data.url) {
      window.location.href = data.url;
      return;
    }
    setMsg(data.message ?? "Use USDT TRC-20 on Fund page");
  };

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        disabled={loading}
        onClick={payStripe}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Opening checkout…" : "Pay with card (Stripe)"}
      </button>
      <Link
        href="/fund"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-100"
      >
        <Wallet className="h-4 w-4" />
        Pay with USDT TRC-20
      </Link>
      {msg && <p className="text-center text-xs text-slate-600">{msg}</p>}
    </div>
  );
}
