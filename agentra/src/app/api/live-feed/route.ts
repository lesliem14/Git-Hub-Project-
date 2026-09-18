import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getLiveFeed } from "@/server/live-feed-service";

export async function GET() {
  const session = await getSessionUser();
  const events = await getLiveFeed(16, session?.accountId);
  return NextResponse.json({ events });
}
