import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { opportunities } from "../../../../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ items: [], source: "mock" });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));

  const db = getDb();
  const items = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.accountId, session.accountId))
    .orderBy(desc(opportunities.detectedAt))
    .limit(limit);

  return NextResponse.json({ items, source: "database" });
}
