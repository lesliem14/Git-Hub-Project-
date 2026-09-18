# Agentra Platform Specification

**Brand:** Agentra · *The AI Agent Network for on-chain Markets*

**Product:** AI MEV Searcher as a Service (non-custodial SaaS)

---

## 1. Product specification

| Area | Description |
|------|-------------|
| **Core value** | Continuous monitoring, simulation, risk-scored execution of legitimate MEV opportunities |
| **Users** | Retail prosumers, quant traders, enterprise desks |
| **Custody** | User wallets only; no seed phrases or private keys in Agentra DB |
| **Monetization** | Tiered subscriptions, optional API, optional performance fee (where legal) |
| **MVP chain** | Ethereum mainnet |
| **MVP DEX** | Uniswap v3, SushiSwap, (+ optional Curve stable pools) |
| **Modes** | Paper → backtest → limited live |

**Explicit exclusions:** sandwich attacks on users, malicious front-running, wallet draining, deceptive txs.

---

## 2. Technical architecture (high level)

```
[Browser / Mobile Web] ──► [Next.js] ──► [API Gateway / BFF]
                              │                    │
                              │              [Auth / Licensing]
                              │                    │
         [WebSocket] ◄────────┴──────► [Trading Orchestrator (Node)]
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            [Opportunity Engine]      [Simulation Service]        [Execution Worker]
                    │                         │                         │
                    ▼                         ▼                         ▼
            [Python Quant/AI]            [RPC Pool]              [User Wallet Signer]
                    │                         │
                    ▼                         ▼
              [PostgreSQL]                 [Redis streams/cache]
```

**Fund locations:**

| Stage | Where funds sit |
|-------|-----------------|
| Idle | User EOA / smart wallet on chain |
| Pre-trade | Same wallet; allowances to allowlisted routers only |
| In-flight | Escrowed in DEX/router contracts during swap leg |
| Post-trade | Back to user wallet (profit or loss on-chain) |
| Subscription | Stripe/crypto invoice—software fee, not trading principal |
| USDT TRC-20 settlement | Treasury hot wallet → user payout address (if business model includes profit share payouts) |

---

## 3. Database schema (core)

See `docs/schema.sql`. Entities: `users`, `accounts`, `subscriptions`, `licenses`, `api_keys`, `bot_configs`, `strategies`, `opportunities`, `simulations`, `executions`, `pnl_ledger`, `settlement_cycles`, `settlement_lines`, `referrals`, `audit_logs`.

---

## 4. Smart contract requirements

- **None required for MVP SaaS** if users sign swaps via EOAs.
- **Optional:** minimal `AgentraPolicyRegistry` (on-chain allowlist reference) for enterprise.
- **No deposit contract holding user principal** (avoids custodial licensing in many jurisdictions).
- If using account abstraction: ERC-4337 smart wallet with session keys scoped by spend limits (stored client-side / HSM, not in Postgres).

---

## 5–8. Backend, frontend, AI, trading engine

- **Frontend:** Next.js 15, TypeScript, Tailwind (`/workspace/agentra`) — dashboard, settlements, fund, referral.
- **Backend:** Node TS services + Python for feature store / ML inference.
- **Trading pipeline:** DATA → DETECT → SIMULATE → AI/RISK → PROFIT CHECK → EXECUTE → VERIFY → ANALYTICS.
- **AI:** Binary/multiclass classifier: `execute` vs `skip` based on historical fill rates, not price direction.

---

## 9. Security model

Non-custodial signing, simulation mandatory, allowlists, caps, kill switch, circuit breakers, rate limits, audit logs, secrets in Vault/KMS, SBOM + dependency scanning, smart contract review for any deployed contracts.

---

## 10. Licensing architecture

`User → Account → Subscription (Stripe) → License record → API entitlements → Bot permissions`

Enforcement at API gateway + worker via Redis-backed quota counters. Webhooks: `checkout.session.completed`, `customer.subscription.updated`, `invoice.paid`.

---

## 11. API specification (excerpt)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/me` | Profile + license |
| GET | `/api/v1/bot/config` | Bot settings |
| PUT | `/api/v1/bot/config` | Update caps / mode |
| POST | `/api/v1/bot/start` | Start (license check) |
| GET | `/api/v1/opportunities` | Paginated feed |
| GET | `/api/v1/settlements/current` | 24h cycle lines |
| GET | `/api/v1/analytics/pnl` | Aggregates |

WebSocket: `opportunities`, `executions`, `bot.status`.

---

## 12. Repository structure

```
agentra/                 # Next.js web app (MVP UI)
services/
  api/                   # REST + WS BFF
  engine/                # Opportunity detection
  executor/              # Tx build & submit
  quant/                 # Python AI/backtest
packages/
  chain-adapters/
  dex-adapters/
  shared-types/
docs/
infra/
  terraform/
  k8s/
```

---

## 13. Development roadmap

1. **MVP (8–12 weeks):** 1 chain, 2–3 DEX, arb detection, simulation, paper, dashboard, wallet connect, Stripe basic, logging.
2. **Beta:** Live with caps, internal dogfood, monitoring.
3. **Production:** SLA, on-call, penetration test.
4. **Multi-chain:** Arbitrum, Base adapters.
5. **AI optimization:** Model retrain pipeline, feature store.
6. **Enterprise:** Dedicated nodes, API, SSO.

---

## 14–17. Testing, backtest, paper, monitoring

- **Unit:** adapters, math, fee accounting.
- **Integration:** fork-based simulation (Anvil/Hardhat).
- **Backtest:** Historical pool state or archived quotes; report net after gas model.
- **Paper:** Same code path without broadcast; record hypothetical fills.
- **Monitoring:** Prometheus + Grafana; alerts on revert rate, latency, RPC errors.

---

## 18–19. Deployment & infra (estimate)

- **MVP:** 2× API, 2× engine workers, managed Postgres, Redis, RPC provider (Alchemy/QuickNode).
- **Rough MVP cost:** $800–2,500/mo excluding dev salaries.

---

## 20. SaaS pricing strategy

| Tier | Price (indicative) |
|------|-------------------|
| Free | $0 |
| Basic | $49/mo |
| Pro | $149/mo |
| Enterprise | $999+/mo + usage |

Optional performance fee: e.g. 10% of **positive** net P&L above high watermark (legal review required).

---

## 21. Unit economics (illustrative blended ARPU $79/mo)

Assumptions: 60% Basic / 30% Pro / 10% Enterprise blend → ~$79 ARPU. COGS per user ~$8–15 (RPC, support allocation).

| Users | MRR | Est. infra+RPC | Support (15%) | Payment (3%) | Gross margin (ex-dev) |
|-------|-----|----------------|---------------|--------------|------------------------|
| 100 | $7,900 | $1,200 | $1,200 | $237 | ~78% |
| 500 | $39,500 | $4,500 | $5,900 | $1,185 | ~72% |
| 1,000 | $79,000 | $8,000 | $11,850 | $2,370 | ~71% |
| 5,000 | $395,000 | $35,000 | $59,250 | $11,850 | ~73% |
| 10,000 | $790,000 | $65,000 | $118,500 | $23,700 | ~74% |

**Break-even (operating, ex-dev):** ~40–80 paying users if 2 FTE engineers ($25k/mo loaded) — highly sensitive to team size.

**Dev cost placeholder:** $40k–120k/mo at scale for eng + security + compliance.

---

## 22. Investor pitch (summary)

Agentra sells **infrastructure and decision software** for a $B+ on-chain flow market, with compliance-first positioning (no toxic MEV). Revenue is recurring; expansion via chains, enterprise API, and quant modules. Risk: competition, RPC costs, regulation, strategy decay.

---

## 23–25. Website, onboarding, marketing

- **Site:** Home, How it works, Pricing, Docs, Login → Dashboard.
- **Onboarding:** Sign up → connect wallet → sign licensing ToS → choose tier → paper trade → risk quiz → enable live.
- **Positioning:** “Professional MEV search software with simulation-first risk controls—not a get-rich-quick bot.”

---

## 26. Risk disclosures

See in-app `/legal/risk`. No promised returns. Show gross/net/fees transparently.

---

## 27. International compliance

| Topic | Note |
|-------|------|
| **Software vs advisory** | Avoid personalized investment advice without license |
| **Custody** | Non-custodial model reduces MTL scope but verify per country |
| **Referrals** | MLM rules in EU/US states |
| **Sanctions** | KYC for fiat subscriptions; geo-block where required |
| **MiCA / SEC** | Performance fees may trigger fund/advisory rules |
| **Tax** | Users responsible; provide export CSV |

---

## A–E classification matrix

| Item | A Possible | B Economic | C Safe | D Test more | E Compliance |
|------|------------|------------|--------|-------------|--------------|
| DEX arb same chain | ✓ | Competitive | With caps | Paper vs live gap | Low |
| Cross-chain arb | ✓ | Often thin | Bridge risk | Extensive | Medium |
| Liquidations | ✓ | Protocol-dependent | Oracle/liquidation risk | Fork tests | Medium |
| Benign back-run | ✓ | Case-by-case | Policy review | Simulation | Medium |
| Sandwich retail | ✓ technically | ✗ policy | ✗ | N/A | High reputational/legal |
| 3% daily profit marketing | ✗ honest claim | ✗ | ✗ | N/A | High (misleading) |
| 24h USDT batch payouts | ✓ | If treasury funded | Reconcile ledger | Treasury drills | Money transmission review |

---

## MVP implementation status (this repo)

- ✅ User dashboard: ledger, 2h trade lock, personal 24h settlement line, performance fee display
- ✅ Admin treasury: `/admin/treasury` (login + bulk verify/payout UI)
- ✅ $100 license, subscription-only referrals, wagmi injected wallet panel, TronLink TRC-20 register
- ✅ PostgreSQL schema + services (ledger, settlements, deposits, trade-lock release)
- ✅ Cron endpoint to close UTC cycle; Tron multi-send adapter (simulated or live key)
- ✅ API v1 (me, bot start/stop, opportunities, executions, analytics, SSE stream, API keys)
- ✅ Paper engine uses DEX + gas simulation packages; executor stub for live signing
- ✅ Stripe webhook stub; rate limits on auth/deposits; referral stats UI
- ✅ Live EVM signing (link wallet + prepare tx + user sign + on-chain confirm, Sepolia default)
- ✅ Uniswap V3 live calldata (wrap + exactInputSingle), multi-step approve/swap confirm
- ⏳ Hosted Postgres in prod, Tron indexer production, Stripe Checkout UI, full arb multi-hop

**Confirmed product decisions:**

| Topic | Decision |
|-------|----------|
| 24h USDT payouts | Trading profit (ledger) **and** referral license commissions |
| Settlements UI | User line on dashboard; full batch **admin-only** |
| Capital | EVM wallet + internal ledger; **2h lock** during open trade |
| Wallets | MetaMask, Trust, Phantom, Keplr (EVM inject); TRC-20 payouts via TronLink/registered address |
| Referrals | 15/10/5% on **$100 license fee** only |
| Performance fee | **10%** on positive trading net (MVP) |
