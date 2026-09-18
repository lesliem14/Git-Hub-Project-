import { createHash, randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { apiKeys } from "../../drizzle/schema";
import { getDb } from "@/lib/db";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createApiKey(accountId: string, name: string) {
  const raw = `agt_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 12);
  const db = getDb();
  const [row] = await db
    .insert(apiKeys)
    .values({
      accountId,
      name,
      keyPrefix: prefix,
      keyHash: hashKey(raw),
    })
    .returning();
  return { id: row.id, name: row.name, prefix: row.keyPrefix, secret: raw };
}

export async function listApiKeys(accountId: string) {
  const db = getDb();
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.accountId, accountId), isNull(apiKeys.revokedAt)));
}

export async function revokeApiKey(accountId: string, keyId: string) {
  const db = getDb();
  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.accountId, accountId)));
}

export async function resolveApiKey(
  bearer: string,
): Promise<{ accountId: string; keyId: string } | null> {
  if (!bearer.startsWith("agt_")) return null;
  const db = getDb();
  const h = hashKey(bearer);
  const row = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, h), isNull(apiKeys.revokedAt)),
  });
  if (!row) return null;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return { accountId: row.accountId, keyId: row.id };
}
