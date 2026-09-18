# Agentra

**The AI Agent Network for on-chain Markets**

Commercial AI-powered **non-custodial** MEV/searcher SaaS (subscription licensing).

## Repository

| Path | Description |
|------|-------------|
| [`agentra/`](./agentra/) | Next.js dashboard (MVP UI) |
| [`docs/AGENTRA_PLATFORM_SPEC.md`](./docs/AGENTRA_PLATFORM_SPEC.md) | Full product & technical specification |
| [`docs/schema.sql`](./docs/schema.sql) | PostgreSQL schema |
| [`dexStarter/`](./dexStarter/) | Legacy starter (reference) |

## Quick start

```bash
cd agentra && npm install && npm run dev
```

## Principles

- No sandwich / malicious front-running product features
- No private key or seed phrase collection
- Execute only when expected net profit > costs + safety buffer
- Transparent P&L and 24h settlement reporting
