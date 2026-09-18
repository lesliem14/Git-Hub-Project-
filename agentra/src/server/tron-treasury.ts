import type { SettlementLine } from "@/lib/types";
import { isValidTrc20Address } from "@/lib/tron-utils";
import { isProductionTronMode } from "./tron-grid";

export interface TreasuryPayoutItem {
  lineId: string;
  toAddress: string;
  amountUsdt: number;
}

export interface TreasuryBatchResult {
  mode: "live" | "simulated";
  batchId: string;
  transfers: { lineId: string; txHash: string; success: boolean; error?: string }[];
}

function payoutDelayMs(): number {
  return parseInt(process.env.AGENTRA_TRON_PAYOUT_DELAY_MS ?? "800", 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalize TronWeb `.send()` return value to a tx id string. */
export function extractTronTxId(tx: unknown): string {
  if (typeof tx === "string" && tx.length > 10) return tx.trim();
  if (tx && typeof tx === "object") {
    const o = tx as Record<string, unknown>;
    if (typeof o.txid === "string") return o.txid;
    if (typeof o.txID === "string") return o.txID;
    const txObj = o.transaction;
    if (txObj && typeof txObj === "object") {
      const t = txObj as Record<string, unknown>;
      if (typeof t.txID === "string") return t.txID;
    }
  }
  const s = String(tx ?? "");
  if (s.length > 10 && !s.includes("[object Object]")) return s;
  return "";
}

function treasuryPayoutMode(): "live" | "simulated" {
  const liveKey = process.env.TRON_TREASURY_PRIVATE_KEY?.trim();
  if (!liveKey) return "simulated";
  if (!isProductionTronMode()) return "simulated";
  return "live";
}

/**
 * Multi-recipient USDT TRC-20 disbursement after ledger verification.
 * Set TRON_TREASURY_PRIVATE_KEY + TRON_FULL_HOST for live sends (server-only).
 */
export async function sendUsdtTrc20Batch(
  items: TreasuryPayoutItem[],
): Promise<TreasuryBatchResult> {
  const mode = treasuryPayoutMode();
  const fullHost = process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
  const usdtContract = process.env.TRON_USDT_CONTRACT ?? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const batchId = `batch_${Date.now()}`;

  if (mode === "simulated") {
    return {
      mode: "simulated",
      batchId,
      transfers: items.map((item) => ({
        lineId: item.lineId,
        txHash: `sim_tron_${item.lineId.slice(0, 8)}_${Math.random().toString(36).slice(2, 10)}`,
        success: true,
      })),
    };
  }

  const liveKey = process.env.TRON_TREASURY_PRIVATE_KEY!.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("tronweb");
  const TronWebCtor = mod.TronWeb ?? mod.default?.TronWeb ?? mod.default;
  const tronWeb = new TronWebCtor({ fullHost, privateKey: liveKey });

  const transfers: TreasuryBatchResult["transfers"] = [];
  const delay = payoutDelayMs();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i > 0 && delay > 0) await sleep(delay);

    if (!isValidTrc20Address(item.toAddress)) {
      transfers.push({
        lineId: item.lineId,
        txHash: "",
        success: false,
        error: "Invalid TRC-20 payout address",
      });
      continue;
    }
    if (item.amountUsdt <= 0) {
      transfers.push({
        lineId: item.lineId,
        txHash: "",
        success: false,
        error: "Amount must be positive",
      });
      continue;
    }

    try {
      const amountSun = Math.floor(item.amountUsdt * 1_000_000);
      if (amountSun <= 0) {
        transfers.push({
          lineId: item.lineId,
          txHash: "",
          success: false,
          error: "Amount below 1 micro-USDT",
        });
        continue;
      }
      const contract = await tronWeb.contract().at(usdtContract);
      const raw = await contract.transfer(item.toAddress, amountSun).send();
      const txHash = extractTronTxId(raw);
      if (!txHash) {
        transfers.push({
          lineId: item.lineId,
          txHash: "",
          success: false,
          error: "Transfer sent but tx id missing from node response",
        });
        continue;
      }
      transfers.push({ lineId: item.lineId, txHash, success: true });
    } catch (err) {
      transfers.push({
        lineId: item.lineId,
        txHash: "",
        success: false,
        error: err instanceof Error ? err.message : "transfer failed",
      });
    }
  }

  return { mode: "live", batchId, transfers };
}

export function mapLinesToPayoutItems(lines: SettlementLine[]): TreasuryPayoutItem[] {
  return lines
    .filter((l) => l.totalDueUsdt > 0)
    .map((l) => ({
      lineId: l.id,
      toAddress: l.usdtWalletTrc20,
      amountUsdt: l.totalDueUsdt,
    }));
}
