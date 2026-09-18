import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { setUserTronWallet } from "@/server/deposit-address";

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { address } = (await request.json()) as { address?: string };
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
  const result = await setUserTronWallet(session.accountId, address);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
