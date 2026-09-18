import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getReferralStats } from "@/server/referral-service";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ referralCode: "AGT-demo8K2", directReferrals: 0, demo: true });
  }
  const stats = await getReferralStats(session.accountId);
  if (!stats) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stats);
}
