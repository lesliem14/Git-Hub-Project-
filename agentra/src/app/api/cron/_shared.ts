import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";

export function cronUnauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function assertCronAuth(request: Request): NextResponse | null {
  if (!isAuthorizedCron(request)) return cronUnauthorized();
  return null;
}
