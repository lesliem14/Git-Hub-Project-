/** One-time license credit (non-withdrawable; usable for trading allocation). */
export const LICENSE_FEE_USDT = 100;

/** Funds locked while an on-chain trade cycle is open. */
export const TRADE_LOCK_HOURS = 2;
export const TRADE_LOCK_MS = TRADE_LOCK_HOURS * 60 * 60 * 1000;

/** Performance fee on positive net trading profit (MVP — disclose in ToS). */
export const PERFORMANCE_FEE_RATE = 0.1;

/** Referral tiers apply to **software license / subscription commission**, not trading P&L. */
export const REFERRAL_TIERS = [
  { level: 1, rate: 0.15, label: "Direct" },
  { level: 2, rate: 0.1, label: "Level 2" },
  { level: 3, rate: 0.05, label: "Level 3" },
] as const;

export const ADMIN_SESSION_COOKIE = "agentra_admin_session";

export const DEMO_ACCOUNT_ID = "00000000-0000-4000-8000-000000000001";

export const USER_SESSION_COOKIE = "agentra_user_session";
