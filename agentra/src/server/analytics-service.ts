import { eq, desc, and, gte } from "drizzle-orm";
import { executions, opportunities } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import type { DashboardMetrics } from "@/lib/types";
import { demoMetrics } from "@/lib/mock-data";

function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

export async function getAccountAnalytics(
  accountId: string,
  cycleStartsAt?: Date,
): Promise<Partial<DashboardMetrics>> {
  const db = getDb();
  const execWhere = cycleStartsAt
    ? and(eq(executions.accountId, accountId), gte(executions.createdAt, cycleStartsAt))
    : eq(executions.accountId, accountId);

  const execs = await db.select().from(executions).where(execWhere).orderBy(desc(executions.createdAt));
  const opps = await db
    .select()
    .from(opportunities)
    .where(
      cycleStartsAt
        ? and(eq(opportunities.accountId, accountId), gte(opportunities.detectedAt, cycleStartsAt))
        : eq(opportunities.accountId, accountId),
    );

  const success = execs.filter((e) => e.status === "success");
  const gross = success.reduce((s, e) => s + num(e.grossUsdt), 0);
  const net = success.reduce((s, e) => s + num(e.netUsdt), 0);
  const gas = success.reduce((s, e) => s + num(e.gasUsdt), 0);
  const fees = success.reduce((s, e) => s + num(e.feesUsdt), 0);
  const failed = execs.length - success.length;
  const successRate = execs.length ? (success.length / execs.length) * 100 : 0;

  const sizes = success.map((e) => num(e.grossUsdt)).filter((x) => x > 0);
  const avgOpp = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;

  let peak = 0;
  let cum = 0;
  let maxDd = 0;
  for (const e of [...success].reverse()) {
    cum += num(e.netUsdt);
    peak = Math.max(peak, cum);
    maxDd = Math.max(maxDd, peak - cum);
  }
  const roiBase = gross > 0 ? net / Math.max(gross, 1) : 0;

  return {
    opportunitiesDetected: opps.length,
    tradesExecuted: success.length,
    grossPnlUsdt: gross,
    gasCostsUsdt: gas,
    protocolFeesUsdt: fees,
    netPnlUsdt: net,
    failedTransactions: failed,
    executionSuccessRate: successRate,
    avgOpportunitySizeUsdt: avgOpp,
    roiPercent: roiBase * 100,
    maxDrawdownPercent: peak > 0 ? (maxDd / peak) * 100 : demoMetrics.maxDrawdownPercent,
  };
}
