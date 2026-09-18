import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";
import { listUnclaimedObservedDeposits } from "@/server/tron-indexer";
import { minTronConfirmations, isProductionTronMode } from "@/server/tron-grid";

/** Recent treasury USDT deposits indexed but not yet claimed (any user may claim with tx hash). */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ deposits: [] });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const limit = 25;
  const deposits = await listUnclaimedObservedDeposits(limit);

  return NextResponse.json({
    deposits,
    tron: {
      mock: !isProductionTronMode(),
      minConfirmations: minTronConfirmations(),
    },
  });
}
