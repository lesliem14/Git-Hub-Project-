# Tron (USDT TRC-20) production runbook

Agentra uses **non-custodial deposits**: users send USDT TRC-20 to the platform treasury from any wallet, then **claim by transaction hash**. A background **indexer** records incoming transfers for visibility; claims still verify on-chain via TronGrid.

## Environment

| Variable | Purpose |
|----------|---------|
| `AGENTRA_TREASURY_TRC20` | Treasury address (34-char base58, `T…`) |
| `AGENTRA_MOCK_TRON` | `false` in production |
| `TRON_API_KEY` | TronGrid Pro API key (recommended for rate limits) |
| `TRON_FULL_HOST` | Default `https://api.trongrid.io` |
| `TRON_USDT_CONTRACT` | Mainnet USDT: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |
| `AGENTRA_TRON_MIN_CONFIRMATIONS` | Default `19` (~1 block/min on Tron) |
| `AGENTRA_TRON_INDEXER_MAX_PAGES` | Pages per cron run (200 txs/page), default `5` |
| `TRON_TREASURY_PRIVATE_KEY` | Hot wallet for **settlement payouts** only (server secret) |
| `AGENTRA_TRON_PAYOUT_DELAY_MS` | Delay between batch payout txs, default `800` |

Payouts are **simulated** unless `TRON_TREASURY_PRIVATE_KEY` is set **and** `AGENTRA_MOCK_TRON` is not `true`.

## Cron: deposit indexer

```bash
curl -X POST "https://YOUR_APP/api/cron/index-tron-deposits" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Schedule every **1–5 minutes** (Vercel Cron, GitHub Actions, or systemd timer). The indexer:

1. Reads `indexer_cursors` for the treasury address
2. Fetches incoming USDT TRC-20 transfers from TronGrid
3. Upserts rows into `treasury_deposits_observed`
4. Writes an `audit_logs` entry

Users claim on **Fund** (`POST /api/deposits/claim`). Verification order: observed row → tx events → account history fallback; requires minimum confirmations.

## API surfaces

- `GET /api/config/tron` — mock mode, min confirmations, payout mode
- `GET /api/deposits/observed` — authenticated list of unclaimed indexed deposits
- `GET /api/health` — includes `mockTron`, `tronApiKey`, `tronPayout`

## Settlement payouts (admin)

1. Close cycle: `POST /api/cron/close-settlement-cycle`
2. Admin verifies ledger lines, then **Treasury payout**
3. Live path: `sendUsdtTrc20Batch` → lines marked `paid` with `payout_tx`, failures → `failed`

## Security

- **Never** expose `TRON_TREASURY_PRIVATE_KEY` to the client or logs.
- Use a **dedicated hot wallet** with limited USDT balance; refill from cold storage.
- Rotate `CRON_SECRET` and restrict cron routes to your scheduler IP where possible.
- Validate payout addresses are TRC-20 base58 before send (built into treasury service).

## Local / demo

With `AGENTRA_MOCK_TRON=true`, use mock claim hashes (`mock_license_100`, `mock_topup_250`) — no TronGrid required.

```bash
cd agentra && npm run demo
```

See also: [TRON_USER_WALLETS.md](./TRON_USER_WALLETS.md), [TESTING.md](../TESTING.md).
