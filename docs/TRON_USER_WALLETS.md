# Deposits & payouts (USDT TRC-20)

## Deposits — any sender

1. User sends **USDT TRC-20** to **`AGENTRA_TREASURY_TRC20`** from any compatible wallet (TronLink, Trust, exchange, etc.).
2. User signs in and **claims** the deposit on **Fund** with the **transaction hash**.
3. First successful claim credits that user’s ledger (license $100 + surplus). The same tx cannot be claimed twice.

The indexer cron **observes** treasury activity for audit; it does **not** require the sender to match a registered address.

## Payouts

User sets **their own** TRC-20 address for 24h settlement payouts (dashboard / profile).

## No platform mnemonic

Agentra does not generate or hold user wallet seeds.
