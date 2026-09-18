import { desc, eq } from "drizzle-orm";
import { executions, opportunities } from "../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { generateLiveFeed } from "@/lib/mock-data";
import { blurUsername } from "@/lib/utils";
import type { LiveProfitEvent } from "@/lib/types";

function num(v: string | null | undefined): number {
  return v ? parseFloat(v) : 0;
}

export async function getLiveFeed(limit = 16, accountId?: string): Promise<LiveProfitEvent[]> {
  if (!isDatabaseConfigured()) {
    return generateLiveFeed(limit);
  }
  try {
    const db = getDb();
    const execs = await db
      .select()
      .from(executions)
      .where(accountId ? eq(executions.accountId, accountId) : undefined)
      .orderBy(desc(executions.createdAt))
      .limit(limit);

    if (execs.length >= 1) {
      return execs.map((e) => ({
        id: e.id,
        blurredUser: blurUsername(e.strategy.slice(0, 8) + e.id.slice(0, 4)),
        strategy: e.strategy,
        netProfitUsdt: num(e.netUsdt),
        chain: "Ethereum",
        timestamp: e.createdAt.toISOString(),
      }));
    }

    const opps = accountId
      ? await db
          .select()
          .from(opportunities)
          .where(eq(opportunities.accountId, accountId))
          .orderBy(desc(opportunities.detectedAt))
          .limit(limit)
      : await db.select().from(opportunities).orderBy(desc(opportunities.detectedAt)).limit(limit);

    const fromOpps: LiveProfitEvent[] = opps.map((o) => ({
      id: o.id,
      blurredUser: blurUsername(o.strategy),
      strategy: o.strategy,
      netProfitUsdt: num(o.expectedNetUsdt),
      chain: "Ethereum",
      timestamp: o.detectedAt.toISOString(),
    }));

    return fromOpps.length ? fromOpps : generateLiveFeed(limit);
  } catch {
    return generateLiveFeed(limit);
  }
}
