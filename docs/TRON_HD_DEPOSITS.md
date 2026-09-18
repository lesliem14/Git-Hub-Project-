# Tron HD deposit addresses

## Overview

Agentra assigns each user a **unique USDT TRC-20 deposit address** derived from a platform-controlled BIP39 mnemonic:

```
m/44'/195'/0'/0/{index}
```

Coin type **195** is Tron (BIP44).

## Environment (server only)

| Variable | Purpose |
|----------|---------|
| `TRON_DEPOSIT_MNEMONIC` | 12 or 24-word seed — **never** commit or expose to frontend |
| `TRON_DEPOSIT_INDEX_START` | First derivation index (default `0`; set `1` if `0` is treasury) |
| `TRON_API_KEY` | TronGrid key for indexer |
| `TRON_TREASURY_PRIVATE_KEY` | Optional hot wallet for batch payouts (separate from HD deposits) |

## Flow

1. User registers → `assignDepositAddress()` takes an unassigned pool row or **mints** via `mintNextPoolDepositAddress()`.
2. User sends USDT TRC-20 to that address.
3. Cron `POST /api/cron/index-tron-deposits` detects transfer → `confirmTrc20Deposit()`.
4. License ($100) credited non-withdrawable; surplus → available balance.

## Operations

```bash
npm run tron:verify-hd
npm run tron:mint-deposits -- 50
```

## Security

- Mnemonic lives in KMS/Vault in production (not plain `.env` on shared hosts).
- Private keys are re-derived only inside `tron-hd-wallet.ts` for future **sweep** automation; never returned via API.
- **A — Technical:** HD + indexer is standard. **C — Safe:** Compromised mnemonic = all deposit addresses at risk; rotate plan required. **E — Compliance:** Custodial deposit addresses may trigger MTL/licensing — legal review required.

## Database

- `deposit_hd_state.next_derivation_index` — monotonic counter
- `deposit_address_pool.derivation_index` — maps address → index for sweeps
