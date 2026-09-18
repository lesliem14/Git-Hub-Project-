# USDT network choice for Agentra

## Short recommendation

| Goal | Suggested network |
|------|-------------------|
| **Low fees + global USDT familiarity (your current model)** | **Tron (USDT TRC-20)** |
| **Same wallet as EVM MEV trading (one stack)** | **Base or Arbitrum (USDT/USDC)** |
| **Lowest per-tx fees, different infra** | **Solana (USDT/USDC SPL)** |

**MVP today is built for USDT TRC-20** (treasury, indexer, claim, 24h payouts). Adding Solana or Base is a **Phase 2** adapter project, not a config toggle.

---

## Tron (USDT TRC-20) — current default

**Pros**

- Very common for USDT transfers; users know “TRC-20”
- Typically **low transfer fees** (often well under $1; varies with chain params)
- Works with **TronLink**, **Trust Wallet**, many exchanges’ withdraw “Tron USDT”

**Cons**

- Separate from your **EVM** trading wallet (MetaMask / Phantom EVM)
- Tron-specific APIs (TronGrid), compliance perception in some regions
- USDT on Tron is **not** the same token as Ethereum or Solana USDT (different chain)

**Verdict:** **Good default** for deposit/payout rail if your audience already uses OTC/TRC-20 flows.

---

## Solana (USDT / USDC SPL)

**Pros**

- **Very low fees** and fast confirmation
- Strong mobile wallet UX (Phantom, etc.)

**Cons**

- Different address format, RPC, indexer, and treasury tooling
- “USDT” on Solana is SPL; users must not send TRC-20 to a Solana address
- Your MEV engine is EVM-first — **third rail** to operate

**Verdict:** **Better fees than Tron in many cases**, but **only worth it** if you invest in a full Sol deposit/payout stack and user education.

---

## EVM L2 (Base, Arbitrum) — USDT or USDC

**Pros**

- **One ecosystem** with MetaMask / Trust / Phantom EVM for trading + funding
- Low L2 gas vs Ethereum mainnet
- Natural fit for **searcher bot** custody and simulation

**Cons**

- Users must select the **correct L2** when withdrawing from exchanges
- USDT liquidity varies by L2; **USDC** is often clearer on Base

**Verdict:** **Best long-term** if Agentra is primarily an **EVM MEV SaaS** and you want one wallet story. Plan **Tron OR L2** for MVP, not both at once.

---

## Classification (A–E)

| | Tron TRC-20 | Solana | EVM L2 |
|---|-------------|--------|--------|
| **A — Technical** | Implemented | Requires new indexer | Requires EVM indexer + treasury |
| **B — Economic** | Low fees | Often lowest | Low fees |
| **C — Safe** | Claim-by-hash reduces wrong-user credit if user signs in | Same pattern possible | Same |
| **E — Compliance** | MSB/custody rules vary by jurisdiction for treasury | Same | Same |

---

## Practical path

1. **Ship MVP on TRC-20** (current code).
2. Measure: fee pain, user errors, support tickets.
3. If users live in MetaMask-only world → add **Base USDC** rail.
4. Do **not** promise “lowest fees on all chains” in marketing; disclose network on Fund page.
