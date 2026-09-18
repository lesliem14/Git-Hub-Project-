import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getBotConfig, saveBotConfig } from "@/server/bot-service";

export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await getBotConfig(session.accountId);
  await saveBotConfig(session.accountId, { ...config, status: "stopped" });
  return NextResponse.json({ ok: true, status: "stopped" });
}
