"use client";

import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function useLinkEvmWallet() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<string | null>(null);
  const [linked, setLinked] = useState<string | null>(null);

  const link = useCallback(async () => {
    if (!address) {
      setStatus("Connect EVM wallet first");
      return false;
    }
    setStatus(null);
    const ch = await fetch("/api/v1/account/evm-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, challengeOnly: true }),
    });
    if (!ch.ok) {
      setStatus("Could not start link challenge");
      return false;
    }
    const { message } = (await ch.json()) as { message: string };
    const signature = await signMessageAsync({ message });
    const res = await fetch("/api/v1/account/evm-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature }),
    });
    if (!res.ok) {
      const d = await res.json();
      setStatus(d.error ?? "Link failed");
      return false;
    }
    setLinked(address);
    setStatus("EVM wallet linked for live signing");
    return true;
  }, [address, signMessageAsync]);

  return { isConnected, address, link, status, linked };
}
