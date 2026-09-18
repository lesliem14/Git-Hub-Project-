#!/usr/bin/env bash
# One-shot local demo: Postgres → migrate → seed → dev server → API smoke test
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP"

PORT="${AGENTRA_PORT:-3000}"
BASE="${AGENTRA_BASE_URL:-http://localhost:${PORT}}"
COOKIE_FILE="${TMPDIR:-/tmp}/agentra-demo-cookies-$$.txt"
DEV_LOG="${TMPDIR:-/tmp}/agentra-demo-dev.log"
STARTED_DEV=0
DEV_PID=""

cleanup() {
  if [ "$STARTED_DEV" = "1" ] && [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    echo ""
    echo "Stopping dev server (PID $DEV_PID)…"
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  rm -f "$COOKIE_FILE" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "== Agentra demo (TRC-20 MVP) =="
echo "App: $APP"
echo "Repo: $ROOT"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required. Install Docker and run again, or follow TESTING.md manually."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker Desktop (or the docker service) and retry."
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example…"
  cp .env.example .env.local
fi

# Dev defaults for mock TRC-20 MVP
ensure_env() {
  local key="$1" val="$2"
  if ! grep -q "^${key}=" .env.local 2>/dev/null; then
    echo "${key}=${val}" >> .env.local
  fi
}
ensure_env "AGENTRA_MOCK_TRON" "true"
ensure_env "AGENTRA_TREASURY_TRC20" "TMockAgentraTreasuryForLocalTesting1"
ensure_env "AGENTRA_ADMIN_PASSWORD" "agentra-admin-dev"
ensure_env "AGENTRA_ADMIN_TOKEN" "dev-admin-token-change-in-production"
ensure_env "CRON_SECRET" "dev-cron-secret"
ensure_env "AGENTRA_SESSION_SECRET" "dev-session-secret"
ensure_env "DATABASE_URL" "postgres://agentra:agentra_dev@localhost:5432/agentra"

set -a
# shellcheck disable=SC1091
source .env.local
set +a

echo "== Starting PostgreSQL (docker compose) =="
docker compose -f "$ROOT/docker-compose.yml" up -d postgres

echo "== Waiting for Postgres =="
ready=0
for _ in $(seq 1 45); do
  if docker compose -f "$ROOT/docker-compose.yml" exec -T postgres pg_isready -U agentra -d agentra >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" != "1" ]; then
  echo "ERROR: Postgres did not become ready in time."
  exit 1
fi
echo "Postgres is ready."

echo "== Migrate + seed =="
npm run db:migrate
npm run db:seed

health_ok() {
  curl -sf "$BASE/api/health" 2>/dev/null | grep -q '"database":"ok"' && \
    curl -sf "$BASE/api/health" 2>/dev/null | grep -q '"status":"healthy"'
}

if health_ok; then
  echo "== Dev server already running at $BASE =="
else
  echo "== Starting dev server on port $PORT =="
  PORT="$PORT" npm run dev >>"$DEV_LOG" 2>&1 &
  DEV_PID=$!
  STARTED_DEV=1
  echo "Log: $DEV_LOG"
  for _ in $(seq 1 90); do
    if health_ok; then
      break
    fi
    if ! kill -0 "$DEV_PID" 2>/dev/null; then
      echo "ERROR: dev server exited. Last log lines:"
      tail -30 "$DEV_LOG" || true
      exit 1
    fi
    sleep 2
  done
  if ! health_ok; then
    echo "ERROR: dev server did not become healthy. Tail of log:"
    tail -40 "$DEV_LOG" || true
    exit 1
  fi
  echo "Dev server healthy."
fi

export AGENTRA_BASE_URL="$BASE"
export CRON_SECRET="${CRON_SECRET:-dev-cron-secret}"
export AGENTRA_COOKIE_FILE="$COOKIE_FILE"

echo ""
echo "== API smoke test =="
bash "$APP/scripts/demo-smoke.sh"

echo ""
echo "=============================================="
echo " Demo complete"
echo " Open:     $BASE"
echo " Login:    trader@agentra.local / agentra-demo-2024"
echo " Fund:     $BASE/fund  →  claim mock_license_100"
echo " Admin:    $BASE/admin/login  →  agentra-admin-dev"
echo "=============================================="
if [ "$STARTED_DEV" = "1" ]; then
  echo "Dev server still running (PID $DEV_PID). Press Ctrl+C to stop this script and shut it down."
  wait "$DEV_PID"
fi
