import { getAgentraTreasuryAddress } from "@/lib/tron-utils";

export const USDT_TRC20_CONTRACT =
  process.env.TRON_USDT_CONTRACT ?? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

/** Hex contract body (without 41 prefix) for USDT mainnet token */
const USDT_HEX_BODY = "a614f803b6fd780986a42c8824e92f8bdd4";

export function getTronFullHost(): string {
  return process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
}

export function getTronHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.TRON_API_KEY;
  if (apiKey) headers["TRON-PRO-API-KEY"] = apiKey;
  return headers;
}

export function isProductionTronMode(): boolean {
  return process.env.AGENTRA_MOCK_TRON !== "true";
}

export function minTronConfirmations(): number {
  return parseInt(process.env.AGENTRA_TRON_MIN_CONFIRMATIONS ?? "19", 10);
}

export function normalizeTronContract(addr: string | undefined): string {
  if (!addr) return "";
  return addr.trim();
}

export function isUsdtTrc20Contract(contractAddress: string | undefined): boolean {
  const c = normalizeTronContract(contractAddress);
  if (!c) return false;
  if (c === USDT_TRC20_CONTRACT) return true;
  const lower = c.toLowerCase();
  if (lower === USDT_TRC20_CONTRACT.toLowerCase()) return true;
  if (lower.includes(USDT_HEX_BODY)) return true;
  if (lower.replace(/^0x/, "") === `41${USDT_HEX_BODY}`) return true;
  return false;
}

export async function tronFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const host = getTronFullHost();
  const url = path.startsWith("http") ? path : `${host}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...getTronHeaders(), ...init?.headers },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`TronGrid ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function getTronConfirmations(txHash: string): Promise<number> {
  try {
    const info = await tronFetch<{ blockNumber?: number }>("/wallet/gettransactioninfobyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: txHash }),
    });
    if (!info.blockNumber || info.blockNumber <= 0) return 0;

    const block = await tronFetch<{ block_header?: { raw_data?: { number?: number } } }>(
      "/wallet/getnowblock",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
    );
    const latest = block.block_header?.raw_data?.number ?? 0;
    if (!latest) return 1;
    return Math.max(0, latest - info.blockNumber + 1);
  } catch {
    return 0;
  }
}

export async function hexToBase58Address(addr: string): Promise<string> {
  if (addr.startsWith("T")) return addr;
  const host = getTronFullHost();
  const res = await fetch(`${host}/wallet/hexstringaddress`, {
    method: "POST",
    headers: { ...getTronHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      hexString: addr.startsWith("41") ? addr : `41${addr.replace(/^0x/, "").slice(-40)}`,
    }),
  });
  if (!res.ok) return addr;
  const j = (await res.json()) as { base58Address?: string };
  return j.base58Address ?? addr;
}

export function treasuryAddressForOps(): string {
  if (process.env.AGENTRA_MOCK_TRON === "true") {
    return process.env.AGENTRA_TREASURY_TRC20?.trim() ?? "";
  }
  return getAgentraTreasuryAddress();
}
