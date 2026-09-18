import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { executions, opportunities } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const execs = await db
    .select()
    .from(executions)
    .where(eq(executions.accountId, session.accountId))
    .orderBy(desc(executions.createdAt))
    .limit(50);
  const opps = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.accountId, session.accountId))
    .orderBy(desc(opportunities.detectedAt))
    .limit(50);

  const n = (v: string | null | undefined) => (v ? parseFloat(v) : 0);
  const success = execs.filter((e) => e.status === "success");
  const gross = success.reduce((s, e) => s + n(e.grossUsdt), 0);
  const net = success.reduce((s, e) => s + n(e.netUsdt), 0);
  const gas = success.reduce((s, e) => s + n(e.gasUsdt), 0);

  return NextResponse.json({
    opportunitiesDetected: opps.length,
    tradesExecuted: success.length,
    grossPnlUsdt: gross,
    gasCostsUsdt: gas,
    netPnlUsdt: net,
    failedTransactions: execs.length - success.length,
    executionSuccessRate: execs.length ? (success.length / execs.length) * 100 : 0,
    recentExecutions: execs.slice(0, 10),
  });
}
