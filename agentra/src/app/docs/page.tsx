export const metadata = { title: "API docs · Agentra" };

const endpoints = [
  ["GET", "/api/v1/me", "Profile, license, bot config"],
  ["GET/PUT", "/api/v1/bot/config", "Bot settings"],
  ["POST", "/api/v1/bot/start", "Start paper bot (license required)"],
  ["POST", "/api/v1/bot/stop", "Stop bot"],
  ["GET", "/api/v1/opportunities", "Detected opportunities"],
  ["GET", "/api/v1/executions", "Trade executions"],
  ["GET", "/api/v1/analytics/pnl", "P&L aggregates"],
  ["GET", "/api/v1/settlements/current", "24h settlement line"],
  ["GET", "/api/v1/stream", "SSE — bot status + live feed"],
  ["POST", "/api/deposits/claim", "Claim USDT TRC-20 deposit by tx hash"],
];

export default function DocsPage() {
  return (
    <div className="max-w-3xl space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">API reference (MVP)</h1>
        <p className="mt-2 text-sm text-slate-600">
          Session cookie auth for browser. Programmatic access:{" "}
          <code className="rounded bg-stone-100 px-1 text-xs">Authorization: Bearer agt_…</code>{" "}
          from Settings → API keys.
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {endpoints.map(([method, path, desc]) => (
              <tr key={path}>
                <td className="px-4 py-3 font-mono text-xs text-teal-800">{method}</td>
                <td className="px-4 py-3 font-mono text-xs">{path}</td>
                <td className="px-4 py-3 text-slate-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Cron (server): <code>POST /api/cron/run-engine</code> with{" "}
        <code>Authorization: Bearer CRON_SECRET</code>. See TESTING.md.
      </p>
    </div>
  );
}
