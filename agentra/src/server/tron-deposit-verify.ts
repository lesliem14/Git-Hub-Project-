import { getAgentraTreasuryAddress } from "@/lib/tron-utils";

const USDT_CONTRACT =
  process.env.TRON_USDT_CONTRACT ?? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

export interface VerifiedTreasuryDeposit {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amountUsdt: number;
}

function parseAmount(value: string, decimals: number): number {
  const raw = BigInt(value);
  const div = BigInt(10 ** decimals);
  return Number(raw / div) + Number(raw % div) / Number(div);
}

async function trongridHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.TRON_API_KEY;
  if (apiKey) headers["TRON-PRO-API-KEY"] = apiKey;
  return headers;
}

/**
 * Load and validate a USDT TRC-20 transfer to Agentra treasury.
 * Sender may be any compatible wallet — not matched to the user's payout address.
 */
export async function verifyTreasuryUsdtDeposit(
  txHash: string,
): Promise<VerifiedTreasuryDeposit | null> {
  const treasury = getAgentraTreasuryAddress();
  const host = process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
  const headers = await trongridHeaders();

  const url = `${host}/v1/transactions/${txHash}/events`;
  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: Array<{
      contract_address?: string;
      event_name?: string;
      result?: Record<string, string>;
    }>;
  };

  for (const ev of json.data ?? []) {
    if (ev.event_name !== "Transfer") continue;
    if (ev.contract_address !== USDT_CONTRACT) continue;
    const to = ev.result?.to ?? ev.result?.["1"];
    const from = ev.result?.from ?? ev.result?.["0"];
    const value = ev.result?.value ?? ev.result?.["2"];
    if (!to || !from || !value) continue;

    const toBase58 = await hexToBase58Address(to, host, headers);
    if (toBase58 !== treasury) continue;

    const fromBase58 = await hexToBase58Address(from, host, headers);
    const amountUsdt = parseAmount(value, 6);
    if (amountUsdt <= 0) continue;

    return {
      txHash,
      fromAddress: fromBase58,
      toAddress: toBase58,
      amountUsdt,
    };
  }

  return null;
}

async function hexToBase58Address(
  addr: string,
  host: string,
  headers: Record<string, string>,
): Promise<string> {
  if (addr.startsWith("T")) return addr;
  const res = await fetch(`${host}/wallet/hexstringaddress`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ hexString: addr.startsWith("41") ? addr : `41${addr.slice(-40)}` }),
  });
  if (!res.ok) return addr;
  const j = (await res.json()) as { base58Address?: string };
  return j.base58Address ?? addr;
}
