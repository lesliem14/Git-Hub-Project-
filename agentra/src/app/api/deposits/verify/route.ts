import { NextResponse } from "next/server";
import { getDepositVerificationDetail } from "@/server/tron-deposit-verify";

/** Pre-check a tx hash before claim (confirmations + treasury USDT). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const txHash = url.searchParams.get("txHash")?.trim();
  if (!txHash) {
    return NextResponse.json({ error: "txHash query param required" }, { status: 400 });
  }

  const detail = await getDepositVerificationDetail(txHash);
  return NextResponse.json(detail, { status: detail.ok ? 200 : 400 });
}
