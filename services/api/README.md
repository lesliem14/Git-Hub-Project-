# Agentra API BFF (MVP)

Production REST + SSE live in the Next.js app under `agentra/src/app/api/v1/`.

This folder documents the split BFF target:

| Surface | MVP location |
|---------|----------------|
| REST `/api/v1/*` | `agentra/src/app/api/v1/` |
| SSE stream | `GET /api/v1/stream` |
| Cron | `POST /api/cron/*` |
| Stripe | `POST /api/webhooks/stripe` |

Future: extract route handlers into this service behind a shared `@agentra/shared-types` contract.
