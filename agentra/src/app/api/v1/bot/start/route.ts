import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { accounts } from "../../../../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { getLiveChainId } from "@/lib/live-chain";
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
    const db = getDb();
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.id, session.accountId),
    });
    if (!account?.evmAddress) {
      return NextResponse.json(
        {
          error: "Link your EVM wallet (sign message) before starting live mode",
          liveChainId: getLiveChainId(),
        },
        { status: 400 },
      );
    }
  }

  await saveBotConfig(session.accountId, { ...config, status: "running" });
  return NextResponse.json({
    ok: true,
    status: "running",
    mode: config.mode,
    liveChainId: config.mode === "live" ? getLiveChainId() : undefined,
  });
}
