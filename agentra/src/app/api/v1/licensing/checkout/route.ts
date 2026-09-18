import { NextResponse } from "next/server";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { getSessionUser } from "@/server/auth-service";

/**
 * Stripe checkout placeholder — MVP activates license via USDT TRC-20 deposit claim.
 * Wire STRIPE_SECRET_KEY + webhook in production.
 */
export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    status: "redirect_to_fund",
    message: `MVP: send ${LICENSE_FEE_USDT} USDT (TRC-20) to treasury and claim tx hash on /fund`,
    fundPath: "/fund",
    mockClaimHashes: ["mock_license_100"],
    stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
