import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getBotConfig, saveBotConfig } from "@/server/bot-service";
import type { BotConfig } from "@/lib/types";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await getBotConfig(session.accountId);
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as BotConfig;
  await saveBotConfig(session.accountId, body);
  return NextResponse.json({ ok: true });
}
