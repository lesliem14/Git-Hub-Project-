"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatUsdt, truncateAddress } from "@/lib/utils";
import { demoUser } from "@/lib/mock-data";
import { useCallback, useEffect, useState } from "react";
import type { WalletKind } from "@/lib/types";
import { Wallet } from "lucide-react";

const WALLET_OPTIONS: { id: WalletKind; label: string; hint: string }[] = [
  { id: "metamask", label: "MetaMask", hint: "EVM trades + WalletConnect" },
  { id: "trust", label: "Trust Wallet", hint: "EVM via WalletConnect · USDT TRC-20" },
  { id: "phantom", label: "Phantom", hint: "EVM mode for signing · register TRC payout" },
  { id: "keplr", label: "Keplr", hint: "EVM extension for signing · register TRC payout" },
  { id: "tron", label: "TronLink / TRC-20", hint: "USDT TRC-20 deposits & 24h payouts" },
];

function isValidTronAddress(addr: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);
}

declare global {
  interface Window {
    tronWeb?: { defaultAddress?: { base58?: string } };
  }
}

export function WalletConnectPanel() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [trc20, setTrc20] = useState(demoUser.usdtPayoutWallet);
  const [tronLinked, setTronLinked] = useState(false);

  const connectEvm = useCallback(() => {
    const injectedFirst = connectors.find((c) => c.type === "injected" || c.id === "injected");
    if (injectedFirst) connect({ connector: injectedFirst });
    else if (connectors[0]) connect({ connector: connectors[0] });
  }, [connect, connectors]);

  const linkTron = () => {
    const addr = window.tronWeb?.defaultAddress?.base58;
    if (addr && isValidTronAddress(addr)) {
      setTrc20(addr);
      setTronLinked(true);
    }
  };

  useEffect(() => {
    if (window.tronWeb?.defaultAddress?.base58) setTronLinked(true);
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Wallet className="h-5 w-5 text-teal-700" />
        Wallets
      </h2>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        Live trades sign from your <strong>EVM wallet</strong>. USDT <strong>TRC-20</strong> is used
        for deposits and 24h payouts. We never store seed phrases or private keys.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {WALLET_OPTIONS.map((w) => (
          <button
            key={w.id}
            type="button"
            disabled={isPending}
            onClick={() => (w.id === "tron" ? linkTron() : connectEvm())}
            className="rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-left hover:border-teal-300 hover:bg-teal-50/50 disabled:opacity-60"
          >
            <span className="block text-sm font-semibold text-slate-900">{w.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{w.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-stone-50 p-3 text-sm">
        <p>
          <span className="text-slate-500">EVM signer: </span>
          {isConnected && address ? (
            <span className="font-mono font-medium text-slate-900">
              {truncateAddress(address, 6)}{" "}
              <span className="text-slate-400">({connector?.name})</span>
            </span>
          ) : (
            <span className="text-slate-400">Not connected</span>
          )}
        </p>
        <p>
          <span className="text-slate-500">USDT TRC-20: </span>
          <span className="font-mono font-medium text-slate-900">{truncateAddress(trc20, 8)}</span>
          {tronLinked && (
            <span className="ml-2 text-xs font-semibold text-emerald-700">Tron linked</span>
          )}
        </p>
        {isConnected && (
          <button
            type="button"
            onClick={() => disconnect()}
            className="text-xs font-semibold text-rose-700 underline"
          >
            Disconnect EVM wallet
          </button>
        )}
      </div>

      <label className="mt-3 block text-xs text-slate-500">
        Register / verify TRC-20 payout address
        <input
          value={trc20}
          onChange={(e) => setTrc20(e.target.value.trim())}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm"
          placeholder="T..."
        />
      </label>
      {!isValidTronAddress(trc20) && trc20.length > 0 && (
        <p className="mt-1 text-xs text-rose-600">Invalid TRC-20 address format.</p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        Internal ledger (excl. license): {formatUsdt(372.45)} USDT available · EVM estimate shown
        separately on dashboard.
      </p>
    </div>
  );
}
