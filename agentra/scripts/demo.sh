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
STARTED_EMBED=0
DEV_PID=""
EMBED_PID=""

cleanup() {
  if [ "$STARTED_DEV" = "1" ] && [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    echo ""
    echo "Stopping dev server (PID $DEV_PID)…"
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  if [ "${AGENTRA_DEMO_KEEP_PG:-}" != "1" ] && [ "$STARTED_EMBED" = "1" ] && [ -n "$EMBED_PID" ] && kill -0 "$EMBED_PID" 2>/dev/null; then
    echo "Stopping embedded Postgres (PID $EMBED_PID)…"
    kill "$EMBED_PID" 2>/dev/null || true
    wait "$EMBED_PID" 2>/dev/null || true
  fi
  rm -f "$COOKIE_FILE" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "== Agentra demo (TRC-20 MVP) =="
echo "App: $APP"
echo "Repo: $ROOT"
echo ""

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example…"
  cp .env.example .env.local
fi

ensure_env() {
  local key="$1" val="$2"
  if ! grep -q "^${key}=" .env.local 2>/dev/null; then
    echo "${key}=${val}" >> .env.local
  fi
}
ensure_env "AGENTRA_MOCK_TRON" "true"
ensure_env "AGENTRA_TREASURY_TRC20" "TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n"
ensure_env "AGENTRA_ADMIN_PASSWORD" "agentra-admin-dev"
ensure_env "AGENTRA_ADMIN_TOKEN" "dev-admin-token-change-in-production"
ensure_env "CRON_SECRET" "dev-cron-secret"
ensure_env "AGENTRA_SESSION_SECRET" "dev-session-secret"
ensure_env "DATABASE_URL" "postgres://agentra:agentra_dev@localhost:5432/agentra"

# Ensure treasury address is valid Tron base58 (34 chars) for /fund UI
if grep -q '^AGENTRA_TREASURY_TRC20=TMock' .env.local 2>/dev/null; then
  sed -i 's|^AGENTRA_TREASURY_TRC20=.*|AGENTRA_TREASURY_TRC20=TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n|' .env.local
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a
export AGENTRA_TREASURY_TRC20="${AGENTRA_TREASURY_TRC20:-TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n}"

start_docker_postgres() {
  echo "== Starting PostgreSQL (Docker) =="
  docker compose -f "$ROOT/docker-compose.yml" up -d postgres
  echo "== Waiting for Postgres =="
  local ready=0
  for _ in $(seq 1 45); do
    if docker compose -f "$ROOT/docker-compose.yml" exec -T postgres pg_isready -U agentra -d agentra >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 1
  done
  if [ "$ready" != "1" ]; then
    echo "ERROR: Docker Postgres did not become ready."
    return 1
  fi
  export DATABASE_URL="${DATABASE_URL:-postgres://agentra:agentra_dev@localhost:5432/agentra}"
  echo "Postgres is ready (Docker)."
}

_embedded_pg_wait() {
  local ready=0
  for _ in $(seq 1 120); do
    if [ -f .agentra-pg.url ]; then
      ready=1
      break
    fi
    if ! kill -0 "$EMBED_PID" 2>/dev/null; then
      return 1
    fi
    sleep 1
  done
  [ "$ready" = "1" ]
}

_embedded_pg_launch() {
  rm -f .agentra-pg.pid
  if [ -f .agentra-pg-data/postmaster.pid ]; then
    old_pg="$(head -1 .agentra-pg-data/postmaster.pid 2>/dev/null || true)"
    if [ -n "$old_pg" ] && kill -0 "$old_pg" 2>/dev/null; then
      kill "$old_pg" 2>/dev/null || true
      sleep 1
    fi
    rm -f .agentra-pg-data/postmaster.pid
  fi
  npx tsx scripts/embedded-db.ts >>"${TMPDIR:-/tmp}/agentra-embedded-pg.log" 2>&1 &
  EMBED_PID=$!
  STARTED_EMBED=1
}

start_embedded_postgres() {
  echo "== Starting PostgreSQL (embedded, no Docker) =="
  if [ -f .agentra-pg.url ] && [ -f .agentra-pg.pid ] && kill -0 "$(cat .agentra-pg.pid)" 2>/dev/null; then
    DATABASE_URL="$(cat .agentra-pg.url)"
    export DATABASE_URL
    echo "Reusing embedded Postgres (PID $(cat .agentra-pg.pid))."
    return 0
  fi

  _embedded_pg_launch
  if ! _embedded_pg_wait; then
    echo "Embedded Postgres failed — resetting data directory and retrying once…"
    kill "$EMBED_PID" 2>/dev/null || true
    rm -rf .agentra-pg-data .agentra-pg.url .agentra-pg.pid
    STARTED_EMBED=0
    _embedded_pg_launch
    if ! _embedded_pg_wait; then
      echo "ERROR: embedded Postgres exited. Log:"
      tail -40 "${TMPDIR:-/tmp}/agentra-embedded-pg.log" || true
      return 1
    fi
  fi
  DATABASE_URL="$(cat .agentra-pg.url)"
  export DATABASE_URL
  echo "Postgres is ready (embedded on ${DATABASE_URL##*@})."
}

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  start_docker_postgres
else
  echo "Docker not available — using embedded PostgreSQL (first run may download binaries)."
  start_embedded_postgres
fi

echo "== Migrate + seed =="
DATABASE_URL="$DATABASE_URL" npm run db:migrate
DATABASE_URL="$DATABASE_URL" npm run db:seed

health_ok() {
  curl -sf "$BASE/api/health" 2>/dev/null | grep -q '"database":"ok"' && \
    curl -sf "$BASE/api/health" 2>/dev/null | grep -q '"status":"healthy"'
}

if health_ok; then
  echo "== Dev server already healthy at $BASE =="
else
  echo "== Starting dev server on port $PORT =="
  DATABASE_URL="$DATABASE_URL" AGENTRA_TREASURY_TRC20="$AGENTRA_TREASURY_TRC20" PORT="$PORT" npm run dev >>"$DEV_LOG" 2>&1 &
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
