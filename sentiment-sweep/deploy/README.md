# Deployment — Social Complaints Sweep

This service is a **scheduled Python worker** (not a web app). It needs outbound access to Meta APIs, Hello Peter email/API, and durable storage for SQLite plus a **restricted** Excel output folder.

## Recommended — Kubernetes CronJob (enterprise)

**This is what most large corporates use:** a shared cluster (usually **AKS** in Microsoft/M365 shops, or EKS/OpenShift elsewhere) with **CronJobs**, **Key Vault–backed secrets**, and **ReadWriteMany** storage for the Excel share (often Azure Files → complaints team / SharePoint).

Full steps: **[kubernetes/README.md](./kubernetes/README.md)**

```bash
# After building/pushing the image and creating secrets:
kubectl apply -f deploy/kubernetes/namespace.yaml
kubectl apply -f deploy/kubernetes/pvc.yaml
kubectl apply -f deploy/kubernetes/cronjob-sweep.yaml
kubectl apply -f deploy/kubernetes/cronjob-report.yaml
```

Schedules are defined in the manifests (`Africa/Johannesburg`: hourly sweep, Monday 07:00 weekly report).

---

## Other options

### Docker Compose (dev / POC / small team)

From `sentiment-sweep/`:

```bash
cp .env.example .env
docker compose up -d --build
```

Runs `supercronic` with `deploy/crontab`. Good for local validation, not typical enterprise production.

### Linux systemd timer

Bare-metal or single VM without Kubernetes: copy `sentiment-sweep.service` and `sentiment-sweep.timer` to `/etc/systemd/system/`, venv under `/opt/sentiment-sweep`.

### Raw cron / Windows Task Scheduler

See project `README.md`. Windows Task Scheduler remains common in legacy estates; greenfield enterprise batches usually move to K8s CronJobs instead.

---

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
