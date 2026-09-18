import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { confirmLiveExecution } from "@/server/trading/live-execution";
import { isDatabaseConfigured } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required" }, { status: 503 });
  }

  const body = (await request.json()) as {
    opportunityId?: string;
    txHash?: string;
    fromAddress?: string;
  };

  if (!body.opportunityId || !body.txHash || !body.fromAddress) {
    return NextResponse.json(
      { error: "opportunityId, txHash, and fromAddress required" },
      { status: 400 },
    );
  }

  const result = await confirmLiveExecution({
    accountId: session.accountId,
    opportunityId: body.opportunityId,
    txHash: body.txHash,
    fromAddress: body.fromAddress,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
