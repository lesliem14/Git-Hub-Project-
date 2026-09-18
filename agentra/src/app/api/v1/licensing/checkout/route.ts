import { NextResponse } from "next/server";
import { LICENSE_FEE_USDT } from "@/lib/constants";
import { getSessionUser } from "@/server/auth-service";
import { createLicenseCheckoutSession, isStripeEnabled } from "@/server/stripe-service";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const origin = new URL(request.url).origin;

  if (isStripeEnabled()) {
    const result = await createLicenseCheckoutSession({
      accountId: session.accountId,
      email: session.email,
      origin,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }
    return NextResponse.json({
      mode: "stripe",
      url: result.url,
      sessionId: result.sessionId,
    });
  }

  return NextResponse.json({
    mode: "trc20",
    status: "redirect_to_fund",
    message: `Send ${LICENSE_FEE_USDT} USDT (TRC-20) to treasury and claim tx hash on /fund`,
    fundPath: "/fund",
    mockClaimHashes: ["mock_license_100"],
    stripeEnabled: false,
  });
}
