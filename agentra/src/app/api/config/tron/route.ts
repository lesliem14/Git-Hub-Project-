import { NextResponse } from "next/server";
import { getAgentraTreasuryAddress, isValidTrc20Address } from "@/lib/tron-utils";
import {
  getTronFullHost,
  isProductionTronMode,
  minTronConfirmations,
  USDT_TRC20_CONTRACT,
} from "@/server/tron-grid";

export async function GET() {
  let treasuryConfigured = false;
  try {
    const t = getAgentraTreasuryAddress();
    treasuryConfigured = Boolean(t && isValidTrc20Address(t));
  } catch {
    treasuryConfigured = Boolean(process.env.AGENTRA_TREASURY_TRC20?.trim());
  }

  const payoutMode =
    process.env.TRON_TREASURY_PRIVATE_KEY?.trim() && isProductionTronMode()
      ? "live"
      : "simulated";

  return NextResponse.json({
    mockTron: !isProductionTronMode(),
    treasuryConfigured,
    minConfirmations: minTronConfirmations(),
    indexerMaxPages: parseInt(process.env.AGENTRA_TRON_INDEXER_MAX_PAGES ?? "5", 10),
    usdtContract: USDT_TRC20_CONTRACT,
    tronFullHost: getTronFullHost(),
    tronApiKeyConfigured: Boolean(process.env.TRON_API_KEY?.trim()),
    treasuryPayoutMode: payoutMode,
  });
}
