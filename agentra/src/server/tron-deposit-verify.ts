import { eq } from "drizzle-orm";
import { treasuryDepositsObserved } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import {
  getTronConfirmations,
  hexToBase58Address,
  isProductionTronMode,
  isUsdtTrc20Contract,
  minTronConfirmations,
  tronFetch,
  treasuryAddressForOps,
  USDT_TRC20_CONTRACT,
} from "./tron-grid";

export interface VerifiedTreasuryDeposit {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amountUsdt: number;
  confirmations: number;
  source: "indexer" | "trongrid";
}

function parseAmount(value: string, decimals: number): number {
  const raw = BigInt(value);
  const div = BigInt(10 ** decimals);
  return Number(raw / div) + Number(raw % div) / Number(div);
}

async function loadFromIndexer(txHash: string): Promise<VerifiedTreasuryDeposit | null> {
  try {
    const db = getDb();
    const row = await db.query.treasuryDepositsObserved.findFirst({
      where: eq(treasuryDepositsObserved.txHash, txHash),
    });
    if (!row) return null;
    const conf = await getTronConfirmations(txHash);
    return {
      txHash,
      fromAddress: row.fromAddress ?? "",
      toAddress: treasuryAddressForOps(),
      amountUsdt: parseFloat(row.amountUsdt),
      confirmations: conf,
      source: "indexer",
    };
  } catch {
    return null;
  }
}

async function loadFromTronGridEvents(txHash: string): Promise<VerifiedTreasuryDeposit | null> {
  const treasury = treasuryAddressForOps();
  if (!treasury) return null;

  const json = await tronFetch<{
    data?: Array<{
      contract_address?: string;
      event_name?: string;
      result?: Record<string, string>;
    }>;
  }>(`/v1/transactions/${txHash}/events`);

  for (const ev of json.data ?? []) {
    if (ev.event_name !== "Transfer") continue;
    if (!isUsdtTrc20Contract(ev.contract_address)) continue;
    const to = ev.result?.to ?? ev.result?.["1"];
    const from = ev.result?.from ?? ev.result?.["0"];
    const value = ev.result?.value ?? ev.result?.["2"];
    if (!to || !from || !value) continue;

    const toBase58 = await hexToBase58Address(to);
    if (toBase58 !== treasury) continue;

    const fromBase58 = await hexToBase58Address(from);
    const amountUsdt = parseAmount(value, 6);
    if (amountUsdt <= 0) continue;

    const confirmations = await getTronConfirmations(txHash);
    return {
      txHash,
      fromAddress: fromBase58,
      toAddress: toBase58,
      amountUsdt,
      confirmations,
      source: "trongrid",
    };
  }

  return null;
}

/** Fallback: account TRC20 transfer list scan (single page) */
async function loadFromAccountHistory(
  txHash: string,
  treasury: string,
): Promise<VerifiedTreasuryDeposit | null> {
  const json = await tronFetch<{
    data?: Array<{
      transaction_id: string;
      from: string;
      to: string;
      value: string;
      token_info?: { decimals?: number; symbol?: string };
    }>;
  }>(
    `/v1/accounts/${treasury}/transactions/trc20?limit=50&contract_address=${USDT_TRC20_CONTRACT}&only_to=true`,
  );
  const hit = (json.data ?? []).find((t) => t.transaction_id === txHash);
  if (!hit || hit.to !== treasury) return null;
  const decimals = Number(hit.token_info?.decimals ?? 6);
  const amountUsdt = parseAmount(hit.value, decimals);
  if (amountUsdt <= 0) return null;
  const confirmations = await getTronConfirmations(txHash);
  return {
    txHash,
    fromAddress: hit.from,
    toAddress: hit.to,
    amountUsdt,
    confirmations,
    source: "trongrid",
  };
}

export async function verifyTreasuryUsdtDeposit(
  txHash: string,
): Promise<VerifiedTreasuryDeposit | null> {
  const normalized = txHash.trim();

  if (process.env.AGENTRA_MOCK_TRON === "true" && normalized.startsWith("mock_")) {
    const treasury =
      process.env.AGENTRA_TREASURY_TRC20?.trim() ?? "TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n";
    let amountUsdt = 100;
    const licenseMatch = normalized.match(/^mock_license_(\d+(?:\.\d+)?)/);
    const topupMatch = normalized.match(/^mock_topup_(\d{1,4}(?:\.\d+)?)/);
    if (licenseMatch) amountUsdt = parseFloat(licenseMatch[1]);
    else if (topupMatch) amountUsdt = parseFloat(topupMatch[1]);
    else if (normalized.startsWith("mock_topup")) amountUsdt = 250;
    return {
      txHash: normalized,
      fromAddress: "TMockSenderWalletForTestingOnly123456",
      toAddress: treasury,
      amountUsdt,
      confirmations: 99,
      source: "trongrid",
    };
  }

  if (!isProductionTronMode() && !process.env.TRON_API_KEY) {
    return null;
  }

  const verified =
    (await loadFromIndexer(normalized)) ??
    (await loadFromTronGridEvents(normalized)) ??
    (await loadFromAccountHistory(normalized, treasuryAddressForOps()));

  if (!verified) return null;

  const minConf = minTronConfirmations();
  if (verified.confirmations < minConf) {
    return null;
  }

  return verified;
}

export async function getDepositVerificationDetail(txHash: string): Promise<{
  ok: boolean;
  confirmations?: number;
  required?: number;
  error?: string;
}> {
  const minConf = minTronConfirmations();
  if (process.env.AGENTRA_MOCK_TRON === "true" && txHash.startsWith("mock_")) {
    return { ok: true, confirmations: 99, required: minConf };
  }

  const conf = await getTronConfirmations(txHash.trim());
  if (conf === 0) {
    return { ok: false, confirmations: 0, required: minConf, error: "Transaction not found or unconfirmed" };
  }
  if (conf < minConf) {
    return {
      ok: false,
      confirmations: conf,
      required: minConf,
      error: `Waiting for confirmations (${conf}/${minConf})`,
    };
  }
  const v = await verifyTreasuryUsdtDeposit(txHash);
  if (!v) {
    return { ok: false, confirmations: conf, required: minConf, error: "Not a USDT transfer to treasury" };
  }
  return { ok: true, confirmations: v.confirmations, required: minConf };
}
