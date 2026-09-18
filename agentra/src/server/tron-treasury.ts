import type { SettlementLine } from "@/lib/types";


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

/**
 * Multi-recipient USDT TRC-20 disbursement after ledger verification.
 * Set TRON_TREASURY_PRIVATE_KEY + TRON_FULL_HOST for live sends (server-only).
 */
export async function sendUsdtTrc20Batch(
  items: TreasuryPayoutItem[],
): Promise<TreasuryBatchResult> {
  const liveKey = process.env.TRON_TREASURY_PRIVATE_KEY;
  const fullHost = process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
  const usdtContract = process.env.TRON_USDT_CONTRACT ?? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const batchId = `batch_${Date.now()}`;

  if (!liveKey) {
    return {
      mode: "simulated",
      batchId,
      transfers: items.map((item) => ({
        lineId: item.lineId,
        txHash: `sim_tron_${item.lineId.slice(0, 8)}_${Math.random().toString(36).slice(2, 8)}`,
        success: true,
      })),
    };
  }

  // Live Tron path: wire TronWeb in deployment (types vary by SDK version).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("tronweb");
  const TronWebCtor = mod.TronWeb ?? mod.default?.TronWeb ?? mod.default;
  const tronWeb = new TronWebCtor({ fullHost, privateKey: liveKey });

  const transfers: TreasuryBatchResult["transfers"] = [];

  for (const item of items) {
    try {
      const amountSun = Math.floor(item.amountUsdt * 1_000_000);
      const contract = await tronWeb.contract().at(usdtContract);
      const tx = await contract.transfer(item.toAddress, amountSun).send();
      transfers.push({ lineId: item.lineId, txHash: String(tx), success: true });
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
