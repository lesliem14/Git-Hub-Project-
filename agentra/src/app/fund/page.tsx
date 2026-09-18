"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { formatUsdt } from "@/lib/utils";

interface ObservedDeposit {
  txHash: string;
  fromAddress: string | null;
  amountUsdt: number;
  blockTimestamp: string | null;
}

export default function FundPage() {
  const [copied, setCopied] = useState(false);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [treasury, setTreasury] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState("");
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [claimErr, setClaimErr] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [observed, setObserved] = useState<ObservedDeposit[]>([]);
  const [minConfirmations, setMinConfirmations] = useState(19);
  const [mockTron, setMockTron] = useState(true);
  const [refreshingObserved, setRefreshingObserved] = useState(false);

  const loadObserved = useCallback(async () => {
    setRefreshingObserved(true);
    const res = await fetch("/api/deposits/observed");
    setRefreshingObserved(false);
    if (!res.ok) return;
    const data = (await res.json()) as {
      deposits?: ObservedDeposit[];
      tron?: { minConfirmations?: number; mock?: boolean };
    };
    setObserved(data.deposits ?? []);
    if (data.tron?.minConfirmations) setMinConfirmations(data.tron.minConfirmations);
    if (typeof data.tron?.mock === "boolean") setMockTron(data.tron.mock);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/config/treasury").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/config/tron").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, cfg, tronCfg]) => {
        setUserWallet(me?.userTrc20Wallet ?? me?.usdtPayoutTrc20 ?? null);
        setTreasury(cfg?.treasuryTrc20 ?? null);
        if (tronCfg?.minConfirmations) setMinConfirmations(tronCfg.minConfirmations);
        if (typeof tronCfg?.mockTron === "boolean") setMockTron(tronCfg.mockTron);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    void loadObserved();
  }, [loadObserved]);

  const copyTreasury = async () => {
    if (!treasury) return;
    await navigator.clipboard.writeText(treasury);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const claimDeposit = async (hash?: string) => {
    const h = (hash ?? txHash).trim();
    if (!h) return;
    setClaiming(true);
    setClaimMsg(null);
    setClaimErr(null);
    const res = await fetch("/api/deposits/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash: h }),
    });
    const data = await res.json();
    setClaiming(false);
    if (!res.ok) {
      const conf =
        data.confirmations != null && data.requiredConfirmations != null
          ? ` (${data.confirmations}/${data.requiredConfirmations} confirmations)`
          : "";
      setClaimErr(`${data.error ?? "Claim failed"}${conf}`);
      return;
    }
    setClaimMsg(
      `Credited ${formatUsdt(data.creditedUsdt)} USDT (${data.purpose === "license" ? "license activated" : "top-up"}).`,
    );
    setTxHash("");
    void loadObserved();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Fund your account</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Send <strong>USDT TRC-20</strong> to Agentra from <strong>any</strong> compatible wallet
          (TronLink, Trust Wallet, exchange withdrawal, etc.). Then paste the transaction hash
          below to credit <strong>your</strong> account. Payout wallet can be set separately for
          24h settlements.
        </p>
      </header>

      <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-800">Agentra treasury (TRC-20)</p>
          {loading ? (
            <p className="mt-2 text-sm text-slate-400">Loading…</p>
          ) : treasury ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-xl bg-teal-50 px-3 py-2 font-mono text-sm text-teal-950">
                {treasury}
              </code>
              <button
                type="button"
                onClick={copyTreasury}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-800">Set AGENTRA_TREASURY_TRC20 on the server.</p>
          )}
        </div>

        {userWallet && (
          <p className="text-xs text-slate-500">
            Your payout wallet (24h USDT):{" "}
            <span className="font-mono text-slate-700">{userWallet}</span>
          </p>
        )}

        <div className="border-t border-stone-100 pt-4">
          <p className="text-sm font-semibold text-slate-900">Claim deposit</p>
          <p className="mt-1 text-xs text-slate-500">
            After sending, paste the Tron transaction ID (hash). Production requires{" "}
            <strong>{minConfirmations}</strong> block confirmations before credit.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Transaction hash"
              className="flex-1 rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              disabled={claiming || !txHash.trim()}
              onClick={() => claimDeposit()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {claiming ? "Verifying…" : "Claim"}
            </button>
          </div>
          {claimMsg && <p className="mt-2 text-sm text-emerald-700">{claimMsg}</p>}
          {claimErr && <p className="mt-2 text-sm text-rose-600">{claimErr}</p>}
        </div>

        {mockTron && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Dev mode: use mock hashes such as{" "}
            <code className="font-mono">mock_license_100</code> or{" "}
            <code className="font-mono">mock_topup_250</code>.
          </p>
        )}

        <p className="text-xs text-slate-500">
          License: {formatUsdt(LICENSE_FEE_USDT)} USDT non-withdrawable when first deposit ≥
          {formatUsdt(LICENSE_FEE_USDT)}.
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Cron indexer logs treasury activity; you still claim with tx hash.
        </p>
      </div>

      {observed.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">Recent unclaimed deposits</p>
            <button
              type="button"
              disabled={refreshingObserved}
              onClick={() => loadObserved()}
              className="text-xs font-medium text-teal-700 underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Indexed incoming USDT to treasury (first claimer links to their account).
          </p>
          <ul className="mt-3 divide-y divide-stone-100">
            {observed.map((d) => (
              <li key={d.txHash} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-slate-800 break-all">{d.txHash}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatUsdt(d.amountUsdt)} USDT
                    {d.fromAddress ? ` · from ${d.fromAddress.slice(0, 8)}…` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={claiming}
                  onClick={() => {
                    setTxHash(d.txHash);
                    void claimDeposit(d.txHash);
                  }}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  Claim
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>
          Use <strong>USDT on Tron (TRC-20)</strong> only. Sign in before claiming. If you are not
          registered,{" "}
          <a href="/register" className="font-semibold underline">
            create an account
          </a>{" "}
          first.
        </p>
      </div>
    </div>
  );
}
