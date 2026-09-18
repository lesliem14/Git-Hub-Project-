import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginUser } from "@/server/auth-service";

export async function POST(request: Request) {
  const rl = rateLimit(`login:${clientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required for login" }, { status: 503 });
  }

  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await loginUser({ email: body.email, password: body.password });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}
