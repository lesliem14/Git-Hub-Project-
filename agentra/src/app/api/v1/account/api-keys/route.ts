import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth-service";
import { createApiKey, listApiKeys, revokeApiKey } from "@/server/api-key-service";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ keys: [] });
  const keys = await listApiKeys(session.accountId);
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database required" }, { status: 503 });
  }
  const { name } = (await request.json()) as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const created = await createApiKey(session.accountId, name.trim());
  return NextResponse.json({ key: created });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await revokeApiKey(session.accountId, id);
  return NextResponse.json({ ok: true });
}
