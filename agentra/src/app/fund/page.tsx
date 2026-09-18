"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { demoUser } from "@/lib/mock-data";
import { formatUsdt, truncateAddress } from "@/lib/utils";

export default function FundPage() {
  const [copied, setCopied] = useState(false);
  const depositAddress = demoUser.usdtPayoutWallet;

  const copy = async () => {
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Fund your account</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Send <strong>USDT TRC-20</strong> to activate your{" "}
          <strong>{formatUsdt(LICENSE_FEE_USDT)} USDT one-time license</strong> (non-withdrawable
          trading credit). Additional deposits increase withdrawable ledger balance after trades
          complete. Live EVM strategies sign from MetaMask, Trust, Phantom, or Keplr—we never ask
          for seed phrases.
        </p>
      </header>

      <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Your deposit address
        </p>
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
        <p className="mt-3 text-xs text-slate-500">
          Linked EVM wallet: {truncateAddress(demoUser.walletAddress, 8)}
        </p>
      </div>

      <ol className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <li>
          <strong>1.</strong> Buy USDT or swap via your exchange (only send TRC-20 to this
          address).
        </li>
        <li>
          <strong>2.</strong> If your exchange lacks TRC-20, use a reputable swap bridge—verify
          network before sending.
        </li>
        <li>
          <strong>3.</strong> Wait for confirmations; credits appear in your ledger (typically
          minutes).
        </li>
        <li>
          <strong>4.</strong> Enable paper trading first; switch to live only after simulation
          review.
        </li>
      </ol>

      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>
          Sending ERC-20 USDT on Ethereum to a TRC-20 address can result in permanent loss.
          Double-check network, token, and address. Agentra cannot reverse mistaken transfers.
        </p>
      </div>
    </div>
  );
}
