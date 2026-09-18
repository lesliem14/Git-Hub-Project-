import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getAccountProfile, getSessionUser } from "@/server/auth-service";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null, demo: true });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const profile = await getAccountProfile(session.accountId);
  return NextResponse.json({ user: session, ...profile });
}
