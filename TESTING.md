# Agentra MVP — test in 10 minutes

## One command (recommended)

From **`agentra/`**:

```bash
cd agentra
npm install
npm run demo
```

This will: start Postgres (**Docker** if available, otherwise **embedded Postgres** — no Docker required) → migrate → seed → start `next dev` (if needed) → run API smoke tests → print login URLs.  
Leave the terminal open to keep the dev server running; **Ctrl+C** stops the server (and embedded Postgres, if used) started by the demo.

Smoke only (server + DB already up):

```bash
npm run demo:smoke
```

## 1. Environment

```bash
cd agentra
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgres://agentra:agentra_dev@localhost:5432/agentra
AGENTRA_MOCK_TRON=true
AGENTRA_TREASURY_TRC20=TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n
AGENTRA_ADMIN_PASSWORD=agentra-admin-dev
AGENTRA_ADMIN_TOKEN=dev-admin-token-change-in-production
CRON_SECRET=dev-cron-secret
AGENTRA_SESSION_SECRET=dev-session-secret
```

## 2. Database

```bash
# from repo root, if Docker available:
docker compose up -d postgres
cd agentra && npm run db:migrate && npm run db:seed
```

## 3. Run app

```bash
cd agentra && npm install && npm run dev
```

Open **http://localhost:3000**

## 4. Test flows

### A. Auth + dashboard
1. **Register** at `/register` (payout wallet optional).
2. **Login** at `/login` or use seed: `trader@agentra.local` / `agentra-demo-2024`
3. Open **Dashboard** — ledger, settlement line, bot controls.

### B. Mock deposit (TRC-20 MVP)
1. Go to **Fund**.
2. Claim tx hash: `mock_license_100` (simulates 100 USDT → activates license).
3. Or `mock_topup_250` for 250 USDT top-up.
4. Refresh dashboard — balance updates.

### C. Paper trading bot
1. Dashboard → **Start** bot (paper mode).
2. Click **Run cycle now** (or cron below).
3. See trade lock, executions, pending settlement change.

```bash
curl -X POST http://localhost:3000/api/cron/run-engine \
  -H "Authorization: Bearer dev-cron-secret"
```

### D. Admin treasury
1. `/admin/login` — password `agentra-admin-dev`
2. `/admin/treasury` — verify + pay selected (simulated Tron).

### E. Health

```bash
curl http://localhost:3000/api/health
```

## 5. What is real vs mock

| Feature | MVP |
|---------|-----|
| USDT TRC-20 deposits | Mock verify when `AGENTRA_MOCK_TRON=true` |
| Paper MEV bot | Simulated opportunities + ledger |
| Live EVM trades | Not enabled (wallet sign post-MVP) |
| Tron payouts | Simulated in admin unless `TRON_TREASURY_PRIVATE_KEY` set |

## 6. API smoke script

With the dev server running:

```bash
CRON_SECRET=dev-cron-secret ./scripts/demo-api-test.sh
```

## 7. Optional engine worker

```bash
cd services/engine && npm install
AGENTRA_API_URL=http://localhost:3000 CRON_SECRET=dev-cron-secret npm start
```

## 8. Roadmap alignment

See `docs/AGENTRA_PLATFORM_SPEC.md` for full architecture. MVP = **1 chain (Ethereum paper)**, **TRC-20 treasury rail**, **licensing**, **dashboard**, **admin settlements**.
