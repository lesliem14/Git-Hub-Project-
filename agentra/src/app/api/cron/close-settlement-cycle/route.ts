import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { closeSettlementCycle } from "@/server/settlement-service";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET ?? "dev-cron-secret";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured", simulated: true },
      { status: 503 },
    );
  }

  const result = await closeSettlementCycle();
  return NextResponse.json({
    ok: true,
    ...result,
    adminNotify: "Treasury review required at /admin/treasury",
  });
}
