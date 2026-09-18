import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { registerUser } from "@/server/auth-service";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required for registration" }, { status: 503 });
  }

  const body = (await request.json()) as {
    email?: string;
    username?: string;
    password?: string;
    usdtPayoutTrc20?: string;
    referralCode?: string;
  };

  if (
    !body.email ||
    !body.username ||
    !body.password ||
    body.password.length < 8 ||
    !body.usdtPayoutTrc20
  ) {
    return NextResponse.json(
      { error: "Email, username, password, and your USDT TRC-20 wallet are required" },
      { status: 400 },
    );
  }

  try {
    const user = await registerUser({
      email: body.email,
      username: body.username,
      password: body.password,
      usdtPayoutTrc20: body.usdtPayoutTrc20,
      referralCode: body.referralCode,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
