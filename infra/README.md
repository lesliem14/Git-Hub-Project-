# Agentra infrastructure (MVP)

| Component | MVP |
|-----------|-----|
| App | Next.js on Vercel / Node |
| Postgres | Managed (RDS, Neon, Supabase) or Docker Compose locally |
| Redis | Optional `REDIS_URL` for quotas (in-memory fallback) |
| Cron | `POST /api/cron/run-engine`, `close-settlement-cycle`, `index-tron-deposits` |
| Secrets | `AGENTRA_SESSION_SECRET`, `CRON_SECRET`, `TRON_TREASURY_PRIVATE_KEY`, Stripe keys |

See `docker-compose.yml` for local Postgres + Redis.
