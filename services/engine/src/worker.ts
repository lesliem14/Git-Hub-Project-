/**
 * Agentra engine worker (MVP stub)
 * Polls the Next.js cron endpoint to run paper trading cycles for all running bots.
 *
 * Usage:
 *   AGENTRA_API_URL=http://localhost:3000 CRON_SECRET=dev-cron-secret npm start
 */
import "dotenv/config";

const API = process.env.AGENTRA_API_URL ?? "http://localhost:3000";
const SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";
const INTERVAL_MS = parseInt(process.env.ENGINE_INTERVAL_MS ?? "60000", 10);

async function tick() {
  const res = await fetch(`${API}/api/cron/run-engine`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  const body = await res.text();
  console.log(`[engine] ${new Date().toISOString()} status=${res.status} ${body.slice(0, 200)}`);
}

console.log(`[engine] Agentra worker → ${API} every ${INTERVAL_MS}ms`);
await tick();
setInterval(tick, INTERVAL_MS);
