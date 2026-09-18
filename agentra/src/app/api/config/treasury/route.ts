import { NextResponse } from "next/server";
import { getAgentraTreasuryAddress } from "@/lib/tron-utils";

export async function GET() {
  try {
    const treasuryTrc20 = getAgentraTreasuryAddress();
    return NextResponse.json({ treasuryTrc20 });
  } catch {
    return NextResponse.json({ treasuryTrc20: null }, { status: 503 });
  }
}
