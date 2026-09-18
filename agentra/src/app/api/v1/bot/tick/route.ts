import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { runPaperTick } from "@/server/trading/pipeline";

export async function POST() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runPaperTick(session.accountId);
  return NextResponse.json(result);
}
