import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { getBotConfig } from "@/server/bot-service";
import { runPaperTick } from "@/server/trading/pipeline";
import { runLivePrepare } from "@/server/trading/live-execution";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { fromAddress?: string };
  const config = await getBotConfig(session.accountId);

  if (config.mode === "live") {
    if (!body.fromAddress) {
      return NextResponse.json(
        { error: "Connect EVM wallet and pass fromAddress for live tick" },
        { status: 400 },
      );
    }
    const live = await runLivePrepare(session.accountId, body.fromAddress);
    if (live.awaitingSignature) {
      return NextResponse.json({
        executed: false,
        awaitingSignature: true,
        opportunityId: live.opportunityId,
        transaction: live.transaction,
        opportunity: live.opportunity,
      });
    }
    return NextResponse.json({ executed: false, reason: live.reason });
  }

  const result = await runPaperTick(session.accountId);
  return NextResponse.json(result);
}
