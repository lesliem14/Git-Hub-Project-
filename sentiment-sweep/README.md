# Clientèle Social Complaints Sweep (v2)

An hourly job that collects **comments, direct messages and reviews** from **Facebook, Instagram and Hello Peter**, works out **which ones come from the same client**, spots **reposts of complaints already handled**, and writes an **hourly Excel queue, oldest complaint first**, with the details needed to find the client in the CRM.

X (Twitter) is excluded on purpose: its API charges per post read.

## What each hourly run does

1. Reads admin updates (Status / Handled By) from last hour's Excel
2. Collects new Facebook + Instagram comments, Messenger + Instagram DMs, Hello Peter reviews
3. Classifies each: sentiment, urgency 1–5, category, regulatory flag (Ombudsman/FSCA/legal)
4. Extracts **email, SA cell number, policy number** from the text (locally, regex)
5. Links it to earlier items: **CONFIRMED** (same email/cell/policy), **LIKELY** (same account or name), **POSSIBLE** (very similar wording), across platforms and across months
6. Flags **SEEN BEFORE** if it repeats a complaint already Acknowledged/Resolved
7. Sends masked alerts (no personal data) to Teams/email for urgent, regulatory or repeat items
8. Writes `social_sweep_LATEST.xlsx` + a timestamped copy

## The hourly Excel

| Sheet | What it shows |
|---|---|
| **Priority Queue** | Every open complaint, **oldest first**, age in hours, SLA flag (amber/red), client group, email/cell/policy no., summary, suggested action, Status + Handled By columns for admins |
| **Same Client** | Comments linked to one client, with why they were linked — the duplicates that are hard to spot in Brandwatch |
| **Seen Before** | New comments that repeat an earlier handled complaint, with who handled it and how many days apart |
| **How to use** | Instructions for admins |

**Admin loop:** open `social_sweep_LATEST.xlsx`, set Status (Acknowledged / Resolved / Not a complaint) and Handled By, save and close. The next run imports it. Handled items leave the queue and are remembered for future reposts.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Windows: copy .env.example .env
```

Then fill `.env`:
- **Meta:** long-lived Page token with `pages_read_engagement`, `pages_read_user_content`, `instagram_basic`, `instagram_manage_comments`; for DMs also `pages_messaging`, `instagram_manage_messages` (Meta App Review).
- **Hello Peter:** `HELLOPETER_MODE=email` (zero credits) with the IMAP mailbox that receives review notifications, or `api` once Hello Peter confirms the endpoint.
- **POLICY_REGEX:** set to the real Clientèle policy number format. The default is a placeholder.
- **EXCEL_OUTPUT_DIR:** a **restricted** folder (e.g. a synced SharePoint folder only the complaints team can open). The file contains personal data.
- **ANTHROPIC_API_KEY** for classification (keyword fallback without it), Teams webhook and/or SMTP for alerts.

## Run

```bash
python main.py sweep --dry-run                          # test, writes nothing
python main.py sweep                                    # the hourly job
python main.py excel                                    # rebuild the Excel from the database
python main.py status facebook:123_456 Resolved --by Thandi
python main.py report                                   # weekly summary + CSV
```

## Schedule

**Enterprise (recommended):** Kubernetes **CronJob** on a shared cluster — usually **AKS** where the org already runs Microsoft/SharePoint workloads. Manifests and AKS notes: [deploy/kubernetes/README.md](./deploy/kubernetes/README.md).

**Alternatives:** Docker Compose (POC), Linux cron/systemd, or Windows Task Scheduler for legacy VMs.

Linux cron (single VM):
```
0 * * * *  cd /path/to/sentiment-sweep && .venv/bin/python main.py sweep
0 7 * * 1  cd /path/to/sentiment-sweep && .venv/bin/python main.py report
```

See [deploy/README.md](./deploy/README.md) for all hosting options.

## Tuning

- `SIMILARITY_THRESHOLD` (default 0.55): lower links more comments (more false matches), higher links fewer
- `SLA_AMBER_HOURS` / `SLA_RED_HOURS`: age flags on the queue
- Categories and urgency guide: `sweep/classify.py`
- Matching rules: `sweep/matching.py`

## Limits to know

- Matching on wording or name is a **suggestion** (POSSIBLE/LIKELY); admins must verify before merging cases.
- Hello Peter email notifications may not include the reviewer's contact details.
- Meta only returns DMs/comments for Clientèle's own Page and Instagram account, not mentions elsewhere.

## Before production

- [ ] POPIA sign-off: restricted Excel folder, retention period, who can access `data/sweep.db`
- [ ] Confirm policy number format and set `POLICY_REGEX`
- [ ] Meta App Review for comment + messaging permissions
- [ ] Spot-check 50 classifications and 20 client links against admin judgement
