# Tron: individual user wallets (no platform mnemonic)

## Model

- Each user registers **their own** USDT TRC-20 address (TronLink, Trust Wallet, etc.).
- **Agentra never stores** user mnemonics or private keys.
- To fund the internal ledger, the user sends USDT **from that wallet** to **`AGENTRA_TREASURY_TRC20`**.
- The deposit indexer matches `transaction.from` → `accounts.usdt_trc20_payout` and credits the account.
- 24h payouts return USDT **to the same user wallet**.

## Configuration

| Variable | Purpose |
|----------|---------|
| `AGENTRA_TREASURY_TRC20` | Company treasury address (receives all user deposits) |
| `TRON_API_KEY` | TronGrid for indexer |
| `TRON_TREASURY_PRIVATE_KEY` | Optional — only for **outbound** batch payouts, not user wallets |

## Cron

```bash
curl -X POST https://your-app/api/cron/index-tron-deposits \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Removed

Platform HD mnemonic (`TRON_DEPOSIT_MNEMONIC`) and custodial per-user derived deposit keys are **not used**.
