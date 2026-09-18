"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { DEFAULT_LIVE_CHAIN_ID } from "@/lib/wagmi-config";
import { formatUsdt } from "@/lib/utils";
import { Loader2, PenLine } from "lucide-react";

type UnsignedTx = {
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas?: string;
  description: string;
};

type PendingLive = {
  opportunityId: string;
  transaction: UnsignedTx;
  opportunity: { netUsdt?: number; strategy?: string };
};

export function LiveSignPanel({ onConfirmed }: { onConfirmed?: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending } = useSendTransaction();
  const [pending, setPending] = useState<PendingLive | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const prepare = useCallback(async () => {
    setMsg(null);
    if (!address) {
      setMsg("Connect and link EVM wallet first");
      return;
    }
    const res = await fetch("/api/v1/bot/tick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAddress: address }),
    });
    const data = await res.json();
    if (data.awaitingSignature && data.transaction) {
      setPending({
        opportunityId: data.opportunityId,
        transaction: data.transaction,
        opportunity: data.opportunity ?? {},
      });
      setMsg("Review and sign in your wallet");
      return;
    }
    setMsg(data.reason ?? data.error ?? "No live opportunity to sign");
  }, [address]);

  const signAndSend = async () => {
    if (!pending || !address) return;
    setMsg(null);
    const tx = pending.transaction;
    try {
      if (chainId !== tx.chainId) {
        await switchChainAsync({ chainId: tx.chainId });
      }
      const hash = await sendTransactionAsync({
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value),
        chainId: tx.chainId,
        gas: tx.gas ? BigInt(tx.gas) : undefined,
      });
      setMsg(`Submitted ${hash.slice(0, 14)}… — confirming on chain`);
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const confirm = await fetch("/api/v1/executions/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opportunityId: pending.opportunityId,
            txHash: hash,
            fromAddress: address,
          }),
        });
        if (confirm.ok) {
          setMsg("Live execution confirmed — ledger updated");
          setPending(null);
          onConfirmed?.();
          return;
        }
      }
      setMsg("Tx sent — confirmation pending; retry confirm from dashboard later");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Signing cancelled or failed");
    }
  };

  const targetChain = DEFAULT_LIVE_CHAIN_ID;

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <PenLine className="h-5 w-5 text-violet-700" />
        Live wallet signing
      </h2>
      <p className="mt-1 text-xs text-slate-600">
        Non-custodial: you sign in MetaMask/Trust/Phantom EVM. Default test network chain ID{" "}
        <strong>{targetChain}</strong> (Sepolia). You pay gas; Agentra never holds your keys.
      </p>

      {!isConnected && (
        <p className="mt-3 text-sm text-amber-800">Connect an EVM wallet above, then link it.</p>
      )}

      {pending ? (
        <div className="mt-4 space-y-3 rounded-xl border border-violet-200 bg-white p-4 text-sm">
          <p className="font-medium">{pending.opportunity.strategy ?? "Opportunity"}</p>
          <p className="text-slate-600">
            Est. net: {formatUsdt(pending.opportunity.netUsdt ?? 0)} USDT (internal ledger credit
            after on-chain confirm)
          </p>
          <p className="text-xs text-slate-500">{pending.transaction.description}</p>
          <button
            type="button"
            disabled={isPending}
            onClick={signAndSend}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign & send transaction
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={prepare}
          disabled={!isConnected}
          className="mt-4 w-full rounded-xl border border-violet-300 bg-white py-3 text-sm font-semibold text-violet-900 disabled:opacity-50"
        >
          Prepare live opportunity (sign next)
        </button>
      )}

      {msg && <p className="mt-3 text-sm text-slate-700">{msg}</p>}
    </div>
  );
}
