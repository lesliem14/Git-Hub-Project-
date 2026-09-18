/** Shared auth for `/api/cron/*` (POST manual + Vercel Cron GET). */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "dev-cron-secret";
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  // Some schedulers pass secret as query param (self-hosted only — avoid on public URLs)
  if (process.env.AGENTRA_CRON_ALLOW_QUERY === "true") {
    try {
      const url = new URL(request.url);
      const q = url.searchParams.get("secret");
      if (q && q === secret) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}
