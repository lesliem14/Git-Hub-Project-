import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { isDatabaseConfigured, getDb } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    database: "skipped",
    mockTron: process.env.AGENTRA_MOCK_TRON === "true" ? "enabled" : "disabled",
    treasury: process.env.AGENTRA_TREASURY_TRC20 ? "configured" : "missing",
    tronApiKey: process.env.TRON_API_KEY?.trim() ? "configured" : "optional",
    tronPayout:
      process.env.TRON_TREASURY_PRIVATE_KEY?.trim() &&
      process.env.AGENTRA_MOCK_TRON !== "true"
        ? "live_key"
        : "simulated",
  };
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.execute(sql`select 1`);
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  }
  const ok = checks.database !== "error";
  return NextResponse.json({ status: ok ? "healthy" : "degraded", checks }, { status: ok ? 200 : 503 });
}
