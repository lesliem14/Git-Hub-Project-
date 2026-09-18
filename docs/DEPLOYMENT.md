# Agentra deployment guide

Deploy the **Next.js app** in `/workspace/agentra`. Postgres is required for auth, ledger, Tron indexer, and settlements. Redis is optional (reserved for future rate-limit/streaming at scale).

## 1. Choose a host

| Option | Best for |
|--------|----------|
| **Vercel** + managed Postgres (Neon, Supabase, Railway) | Fast MVP, cron via `vercel.json` |
| **Docker** on VPS | Full control, self-hosted cron |
| **Railway / Render** | Single platform for app + Postgres |

Root directory for build: **`agentra`** (not monorepo root).

```bash
cd agentra
npm ci && npm run build
npm start   # or platform start command
```

## 2. Required environment variables

Copy `agentra/.env.example` → production env on your host.

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AGENTRA_SESSION_SECRET` | Long random string |
| `AGENTRA_ADMIN_PASSWORD` | Admin treasury login |
| `AGENTRA_ADMIN_TOKEN` | Cookie token for `/admin/*` |
| `CRON_SECRET` | Bearer token for cron routes; **set on Vercel** — Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` |
| `AGENTRA_TREASURY_TRC20` | Tron treasury address for USDT deposits |

**Production Tron:** see [TRON_PRODUCTION.md](./TRON_PRODUCTION.md) (`AGENTRA_MOCK_TRON=false`, `TRON_API_KEY`, optional `TRON_TREASURY_PRIVATE_KEY`).

**Live EVM (Sepolia/mainnet):** `AGENTRA_LIVE_CHAIN_ID`, RPC URLs, user wallet signing — see [LIVE_SIGNING.md](./LIVE_SIGNING.md).

**Stripe (optional):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs.

Run migrations once:

```bash
cd agentra && npm run db:migrate
# optional seed for staging only:
npm run db:seed
```

## 3. Cron jobs

All cron endpoints accept **GET or POST** with:

```http
Authorization: Bearer <CRON_SECRET>
```

| Endpoint | Suggested schedule | Purpose |
|----------|-------------------|---------|
| `/api/cron/index-tron-deposits` | Every 5 min | Index treasury USDT TRC-20 |
| `/api/cron/run-engine` | Every 2 min | Paper/live bot ticks + trade lock release |
| `/api/cron/close-settlement-cycle` | Daily (e.g. 00:05 UTC) | Build settlement lines |

**Vercel:** `agentra/vercel.json` defines these schedules. Set `CRON_SECRET` in the Vercel project; do not commit secrets.

**Self-hosted cron (example):**

```bash
*/5 * * * * curl -sf -X POST "https://app.example.com/api/cron/index-tron-deposits" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Optional: `AGENTRA_CRON_ALLOW_QUERY=true` allows `?secret=` (use only on private networks).

## 4. Stripe webhooks

Point Stripe to:

```text
https://YOUR_DOMAIN/api/webhooks/stripe
```

Events: `checkout.session.completed`, `customer.subscription.updated`, `invoice.paid` (see `server/stripe-service.ts`).

## 5. Post-deploy checklist

- [ ] `GET /api/health` → `database: ok`, treasury configured
- [ ] Register user → **Fund** → claim (mock or real Tron)
- [ ] `POST /api/cron/index-tron-deposits` with cron auth (production Tron)
- [ ] Admin `/admin/treasury` — verify ledger → payout (simulated until treasury key)
- [ ] Dashboard live mode on Sepolia (if enabled)
- [ ] Rotate default admin password and `CRON_SECRET`

## 6. Local / demo

```bash
cd agentra && npm run demo
```

See [TESTING.md](../TESTING.md).

## 7. Security

- Never expose `TRON_TREASURY_PRIVATE_KEY` or `STRIPE_SECRET_KEY` to the client.
- Use HTTPS only; secure cookies in production (`NODE_ENV=production`).
- Restrict admin routes; use strong `AGENTRA_ADMIN_TOKEN`.
- Tron hot wallet: minimal balance, monitor payouts.

## Related docs

- [TRON_PRODUCTION.md](./TRON_PRODUCTION.md)
- [TRON_USER_WALLETS.md](./TRON_USER_WALLETS.md)
- [LIVE_SIGNING.md](./LIVE_SIGNING.md)
- [NETWORK_CHOICE.md](./NETWORK_CHOICE.md)
