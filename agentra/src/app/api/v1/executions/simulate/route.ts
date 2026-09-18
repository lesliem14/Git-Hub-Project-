import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { simulateUnsignedTransaction } from "@/server/trading/tx-simulate";
import type { UnsignedLiveTransaction } from "@/server/trading/live-execution";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    fromAddress?: string;
    transaction?: UnsignedLiveTransaction;
  };

  if (!body.fromAddress || !body.transaction) {
    return NextResponse.json({ error: "fromAddress and transaction required" }, { status: 400 });
  }

  const from = body.fromAddress.trim().toLowerCase() as `0x${string}`;
  const result = await simulateUnsignedTransaction(from, body.transaction);
  if (!result.ok) {
    return NextResponse.json({ simulated: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ simulated: true });
}
