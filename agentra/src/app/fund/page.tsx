"use client";

import { useEffect, useState } from "react";
import { Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

export default function FundPage() {
  const [copied, setCopied] = useState<"treasury" | "wallet" | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [treasury, setTreasury] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/config/treasury").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, cfg]) => {
        setUserWallet(me?.userTrc20Wallet ?? me?.usdtPayoutTrc20 ?? null);
        setTreasury(cfg?.treasuryTrc20 ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copy = async (text: string, which: "treasury" | "wallet") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Fund your account</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Use <strong>your own</strong> USDT TRC-20 wallet (TronLink, Trust, etc.). Send USDT to
          the Agentra treasury from that wallet only — the indexer matches your address and credits
          your ledger. We never hold your mnemonic or private keys.
        </p>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Your wallet (must match sender)</p>
          {loading ? (
            <p className="mt-2 text-sm text-slate-400">Loading…</p>
          ) : userWallet ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-xl bg-stone-50 px-3 py-2 font-mono text-sm">
                {userWallet}
              </code>
              <button
                type="button"
                onClick={() => copy(userWallet, "wallet")}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold"
              >
                {copied === "wallet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              <a href="/register" className="font-semibold text-teal-800 underline">
                Register
              </a>{" "}
              or{" "}
              <a href="/login" className="font-semibold text-teal-800 underline">
                sign in
              </a>{" "}
              with your TRC-20 address.
            </p>
          )}
        </div>

        <div className="border-t border-stone-100 pt-4">
          <p className="text-xs font-semibold uppercase text-teal-800">Send USDT TRC-20 to</p>
          {treasury ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-xl bg-teal-50 px-3 py-2 font-mono text-sm text-teal-950">
                {treasury}
              </code>
              <button
                type="button"
                onClick={() => copy(treasury, "treasury")}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
              >
                {copied === "treasury" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-800">Treasury address not configured on server.</p>
          )}
        </div>

        <p className="text-xs text-slate-500">
          License: {formatUsdt(LICENSE_FEE_USDT)} USDT (non-withdrawable credit). Extra balance goes
          to your available ledger.
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Auto-confirm via <code className="rounded bg-stone-100 px-1">/api/cron/index-tron-deposits</code>
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>
          Send only from your registered wallet. Transfers from other addresses cannot be matched to
          your account. Use TRC-20 only — not ERC-20.
        </p>
      </div>
    </div>
  );
}
