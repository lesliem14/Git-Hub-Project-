#!/usr/bin/env bash
set -euo pipefail
BASE="${AGENTRA_BASE_URL:-http://localhost:3000}"
CRON="${CRON_SECRET:-dev-cron-secret}"
COOKIE="${AGENTRA_COOKIE_FILE:-/tmp/agentra-cookies.txt}"

echo "== Health =="
curl -sf "$BASE/api/health"
echo

echo "== Treasury config =="
curl -sf "$BASE/api/config/treasury" || { echo "treasury config failed (check AGENTRA_TREASURY_TRC20)"; exit 1; }
echo

echo "== Login (seed user) =="
curl -sf -c "$COOKIE" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@agentra.local","password":"agentra-demo-2024"}'
echo

echo "== Me =="
curl -sf -b "$COOKIE" "$BASE/api/v1/me" | head -c 500
echo

echo "== Mock top-up claim =="
HASH="mock_topup_50_$(date +%s)"
curl -sf -b "$COOKIE" -X POST "$BASE/api/deposits/claim" \
  -H "Content-Type: application/json" \
  -d "{\"txHash\":\"$HASH\"}" || echo "(claim skipped — use mock_topup_50)"
echo

echo "== Bot start + tick =="
curl -sf -b "$COOKIE" -X PUT "$BASE/api/v1/bot" \
  -H "Content-Type: application/json" \
  -d '{"mode":"paper","status":"running","riskLevel":"balanced","maxCapitalUsdt":1000,"maxTradeSizeUsdt":100,"maxDailyLossUsdt":50,"minExpectedProfitUsdt":5}'
curl -sf -b "$COOKIE" -X POST "$BASE/api/v1/bot/tick"
echo

echo "== Cron run-engine =="
curl -sf -X POST "$BASE/api/cron/run-engine" -H "Authorization: Bearer $CRON"
echo

echo "== Analytics =="
curl -sf -b "$COOKIE" "$BASE/api/v1/analytics" | head -c 500
echo

echo "Smoke test OK."
