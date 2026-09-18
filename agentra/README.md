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

Flow: **Verify ledger** on selected rows → **Pay selected** (mock Tron tx until treasury API is wired).

### Tron deposit indexer (auto-confirm)

```bash
curl -X POST http://localhost:3000/api/cron/index-tron-deposits \
  -H "Authorization: Bearer $CRON_SECRET"
```

Runs TronGrid scan on each user’s assigned `deposit_address_trc20`, credits license ($100) or top-up.

### User auth

- Register: `/register` · Login: `/login`
- Demo (after seed): `trader@agentra.local` / `agentra-demo-2024`
- Dashboard requires session when `DATABASE_URL` is set.
