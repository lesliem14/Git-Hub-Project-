import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getBotConfig, saveBotConfig } from "@/server/bot-service";
import { requireActiveLicense } from "@/server/licensing-service";

export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const license = await requireActiveLicense(session.accountId);
  if (!license.ok) {
    return NextResponse.json({ error: license.reason }, { status: 402 });
  }

  const config = await getBotConfig(session.accountId);
  if (config.mode === "live") {
    return NextResponse.json(
      { error: "Live mode requires wallet signing (post-MVP). Use paper mode." },
      { status: 400 },
    );
  }

  await saveBotConfig(session.accountId, { ...config, status: "running" });
  return NextResponse.json({ ok: true, status: "running" });
}
