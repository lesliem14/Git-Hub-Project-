import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { executions } from "../../../../../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/server/auth-service";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return new NextResponse("strategy,net_usdt,status,created_at\n", {
      headers: { "Content-Type": "text/csv" },
    });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(executions)
    .where(eq(executions.accountId, session.accountId))
    .orderBy(desc(executions.createdAt))
    .limit(5000);

  const header = "strategy,gross_usdt,gas_usdt,net_usdt,status,mode,tx_hash,created_at\n";
  const lines = rows.map(
    (r) =>
      `${r.strategy},${r.grossUsdt ?? 0},${r.gasUsdt ?? 0},${r.netUsdt ?? 0},${r.status},${r.mode},${r.txHash ?? ""},${r.createdAt.toISOString()}`,
  );
  return new NextResponse(header + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="agentra-executions.csv"',
    },
  });
}
