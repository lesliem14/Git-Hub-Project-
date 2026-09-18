# Agentra Web App

**The AI Agent Network for on-chain Markets**

Mobile-responsive Next.js dashboard for the Agentra MEV searcher SaaS MVP UI.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run db:setup   # Postgres + migrate + seed (requires Docker)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Bot controls, P&L, strategies |
| `/dashboard#settlement` | **Your** 24h USDT line (profit + referral commissions) |
| `/admin/treasury` | **Admin only** — bulk verify ledger & pay all wallets |
| `/admin/login` | Treasury login (see `.env.example`) |
| `/how-it-works` | Legitimate pipeline + educational diagrams |
| `/fund` | USDT TRC-20 deposit instructions |
| `/referral` | Commission tiers |
| `/pricing` | Subscription tiers |

Platform specification: `/workspace/docs/AGENTRA_PLATFORM_SPEC.md`

### Admin treasury (you only)

Set in `.env.local`:

```
AGENTRA_ADMIN_PASSWORD=your-strong-password
AGENTRA_ADMIN_TOKEN=long-random-token
```

Default dev password: `agentra-admin-dev` · token: `dev-admin-token-change-in-production`

Flow: **Verify ledger** on selected rows → **Pay selected** (simulated USDT batch unless `TRON_TREASURY_PRIVATE_KEY` + production Tron).

### Tron deposits & indexer

Users send USDT TRC-20 to **`AGENTRA_TREASURY_TRC20`**, then **claim by tx hash** on `/fund` (any sender wallet). The indexer observes treasury inflows for the Fund UI and audit.

```bash
curl -X POST http://localhost:3000/api/cron/index-tron-deposits \
  -H "Authorization: Bearer $CRON_SECRET"
```

Docs: `docs/TRON_USER_WALLETS.md`, `docs/TRON_PRODUCTION.md`, `docs/DEPLOYMENT.md`.

### One-command demo

```bash
npm run demo
```

### User auth

- Register: `/register` · Login: `/login`
- Demo (after seed): `trader@agentra.local` / `agentra-demo-2024`
- Dashboard requires session when `DATABASE_URL` is set.
