import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth-service";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
