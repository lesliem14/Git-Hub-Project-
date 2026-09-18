/**
 * Optional Redis for quotas / rate limits (MVP falls back to in-memory rate-limit.ts).
 */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export async function redisIncr(_key: string): Promise<number | null> {
  if (!isRedisConfigured()) return null;
  // Wire ioredis when REDIS_URL is set in production.
  return null;
}
