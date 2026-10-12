# Deployment — Social Complaints Sweep

This service is a **scheduled Python worker** (not a web app). Run it hourly on a VM, container host, or Windows server with access to Meta APIs, Hello Peter email/API, and a **restricted** Excel output folder.

## Option A — Docker Compose (recommended)

From `sentiment-sweep/`:

```bash
cp .env.example .env
# Edit .env with production secrets and EXCEL_OUTPUT_DIR=/data/output

docker compose up -d --build
```

The container runs `supercronic` with `deploy/crontab` (hourly sweep + weekly report).

Volumes (see `docker-compose.yml`):

| Mount | Purpose |
|-------|---------|
| `./data` → `/app/data` | SQLite (`sweep.db`) — restrict filesystem ACLs |
| `./output` → `/app/output` | Excel queue (sync to SharePoint if required) |

Health check: `python main.py sweep --dry-run`

## Option B — Linux systemd timer

1. Install app under `/opt/sentiment-sweep` with venv and `.env`.
2. Copy `deploy/sentiment-sweep.service` and `deploy/sentiment-sweep.timer` to `/etc/systemd/system/`.
3. `systemctl daemon-reload && systemctl enable --now sentiment-sweep.timer`

## Option C — Raw cron

Use the crontab lines in the project README; ensure `WorkingDirectory` points at `sentiment-sweep` and the venv Python is used.

## Environment checklist

| Variable | Required for go-live |
|----------|----------------------|
| `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID` | Facebook + IG collection |
| `META_IG_USER_ID` | Instagram comments |
| `HELLOPETER_*` | Hello Peter ingestion |
| `POLICY_REGEX` | Accurate policy extraction |
| `EXCEL_OUTPUT_DIR` | Restricted output path |
| `DATABASE_PATH` | Persistent DB on durable disk |
| `ANTHROPIC_API_KEY` | Recommended (keyword fallback exists) |
| `TEAMS_WEBHOOK_URL` and/or SMTP | Masked alerts |

## POPIA / security

- Do not commit `.env`, `data/`, or `output/`.
- Mount Excel output to a folder with complaints-team-only ACLs.
- Back up `data/sweep.db` on a retention policy aligned with legal/compliance.
