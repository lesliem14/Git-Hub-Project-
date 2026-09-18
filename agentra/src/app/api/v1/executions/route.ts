import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { executions } from "../../../../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getAuthContext } from "@/server/auth-context";

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ items: [] });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));

  const db = getDb();
  const items = await db
    .select()
    .from(executions)
    .where(eq(executions.accountId, auth.accountId))
    .orderBy(desc(executions.createdAt))
    .limit(limit);

  return NextResponse.json({ items, source: "database" });
}
