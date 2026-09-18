"use client";

import { useEffect, useState } from "react";
import { Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

export default function FundPage() {
  const [copied, setCopied] = useState(false);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setDepositAddress(data?.depositAddressTrc20 ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copy = async () => {
    if (!depositAddress) return;
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Fund your account</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Send <strong>USDT TRC-20</strong> to your unique deposit address. The{" "}
          <strong>Tron indexer</strong> auto-confirms transfers and credits your ledger (
          {formatUsdt(LICENSE_FEE_USDT)} USDT license fee is non-withdrawable).
        </p>
      </header>

      <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Your deposit address (TRC-20)
        </p>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : depositAddress ? (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all rounded-xl bg-stone-50 px-3 py-3 font-mono text-sm text-slate-900">
              {depositAddress}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            <LinkSignIn /> to receive your assigned deposit address.
          </p>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Deposits are picked up by the cron job{" "}
          <code className="rounded bg-stone-100 px-1">/api/cron/index-tron-deposits</code>
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>Only send USDT on the Tron (TRC-20) network. Wrong network can mean permanent loss.</p>
      </div>
    </div>
  );
}

function LinkSignIn() {
  return (
    <>
      Please{" "}
      <a href="/login" className="font-semibold text-teal-800 underline">
        sign in
      </a>{" "}
      or{" "}
      <a href="/register" className="font-semibold text-teal-800 underline">
        register
      </a>
    </>
  );
}
