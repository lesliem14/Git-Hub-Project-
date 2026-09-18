import { eq } from "drizzle-orm";
import { botConfigs } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import type { BotConfig } from "@/lib/types";

function num(v: string | null | undefined, fallback: number): number {
  return v ? parseFloat(v) : fallback;
}

export async function getBotConfig(accountId: string): Promise<BotConfig> {
  const db = getDb();
  let row = await db.query.botConfigs.findFirst({ where: eq(botConfigs.accountId, accountId) });
  if (!row) {
    [row] = await db
      .insert(botConfigs)
      .values({ accountId })
      .returning();
  }
  return {
    mode: row.mode,
    status: row.status,
    riskLevel: row.riskLevel as BotConfig["riskLevel"],
    maxCapitalUsdt: num(row.maxCapitalUsdt, 1000),
    maxTradeSizeUsdt: num(row.maxTradeSizeUsdt, 100),
    maxDailyLossUsdt: num(row.maxDailyLossUsdt, 50),
    minExpectedProfitUsdt: num(row.minExpectedProfitUsdt, 5),
  };
}

export async function saveBotConfig(accountId: string, config: BotConfig): Promise<void> {
  const db = getDb();
  await db
    .insert(botConfigs)
    .values({
      accountId,
      mode: config.mode,
      status: config.status,
      riskLevel: config.riskLevel,
      maxCapitalUsdt: String(config.maxCapitalUsdt),
      maxTradeSizeUsdt: String(config.maxTradeSizeUsdt),
      maxDailyLossUsdt: String(config.maxDailyLossUsdt),
      minExpectedProfitUsdt: String(config.minExpectedProfitUsdt),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: botConfigs.accountId,
      set: {
        mode: config.mode,
        status: config.status,
        riskLevel: config.riskLevel,
        maxCapitalUsdt: String(config.maxCapitalUsdt),
        maxTradeSizeUsdt: String(config.maxTradeSizeUsdt),
        maxDailyLossUsdt: String(config.maxDailyLossUsdt),
        minExpectedProfitUsdt: String(config.minExpectedProfitUsdt),
        updatedAt: new Date(),
      },
    });
}
