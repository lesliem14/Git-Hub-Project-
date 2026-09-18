#!/usr/bin/env bash
# Smoke test against running dev server (requires Postgres + migrate + seed)
set -euo pipefail
BASE="${AGENTRA_BASE_URL:-http://localhost:3000}"
CRON="${CRON_SECRET:-dev-cron-secret}"

echo "== Health =="
curl -sf "$BASE/api/health" | head -c 500
echo

echo "== Treasury config =="
curl -sf "$BASE/api/config/treasury"
echo

echo "== Register (may fail if email taken) =="
EMAIL="test-$(date +%s)@agentra.local"
curl -sf -c /tmp/agentra-cookies.txt -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"test-pass-123\",\"username\":\"tester\",\"usdtTrc20Payout\":\"TMockUserPayoutWallet123456789\"}" || true
echo

echo "== Login demo seed =="
curl -sf -c /tmp/agentra-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@agentra.local","password":"agentra-demo-2024"}'
echo

echo "== Me =="
curl -sf -b /tmp/agentra-cookies.txt "$BASE/api/v1/me" | head -c 400
echo

echo "== Mock license deposit claim =="
curl -sf -b /tmp/agentra-cookies.txt -X POST "$BASE/api/deposits/claim" \
  -H "Content-Type: application/json" \
  -d '{"txHash":"mock_license_100"}' || echo "(claim may fail if already used)"
echo

echo "== Start bot + tick =="
curl -sf -b /tmp/agentra-cookies.txt -X PUT "$BASE/api/v1/bot" \
  -H "Content-Type: application/json" \
  -d '{"mode":"paper","status":"running","riskLevel":"balanced","maxCapitalUsdt":1000,"maxTradeSizeUsdt":100,"maxDailyLossUsdt":50,"minExpectedProfitUsdt":5}'
curl -sf -b /tmp/agentra-cookies.txt -X POST "$BASE/api/v1/bot/tick"
echo

echo "== Cron run-engine =="
curl -sf -X POST "$BASE/api/cron/run-engine" -H "Authorization: Bearer $CRON"
echo

echo "== Analytics =="
curl -sf -b /tmp/agentra-cookies.txt "$BASE/api/v1/analytics" | head -c 400
echo
echo "Done."
