import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  bigserial,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const settlementStatusEnum = pgEnum("settlement_status", [
  "pending",
  "processing",
  "paid",
  "failed",
]);

export const botModeEnum = pgEnum("bot_mode", ["paper", "live"]);
export const botStatusEnum = pgEnum("bot_status", ["running", "stopped", "paused"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  evmAddress: text("evm_address"),
  usdtTrc20Payout: text("usdt_trc20_payout"),
  /** @deprecated Mirror of user-owned wallet; same as usdtTrc20Payout */
  depositAddressTrc20: text("deposit_address_trc20"),
  referralCode: text("referral_code").unique(),
  referredByAccountId: uuid("referred_by_account_id"),
  licenseActivated: boolean("license_activated").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ledgerAccounts = pgTable("ledger_accounts", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id),
  availableUsdt: numeric("available_usdt", { precision: 24, scale: 8 }).default("0").notNull(),
  licenseCreditUsdt: numeric("license_credit_usdt", { precision: 24, scale: 8 })
    .default("0")
    .notNull(),
  lockedInTradeUsdt: numeric("locked_in_trade_usdt", { precision: 24, scale: 8 })
    .default("0")
    .notNull(),
  pendingWithdrawableUsdt: numeric("pending_withdrawable_usdt", { precision: 24, scale: 8 })
    .default("0")
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tradeLocks = pgTable("trade_locks", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  amountUsdt: numeric("amount_usdt", { precision: 24, scale: 8 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  releasesAt: timestamp("releases_at", { withTimezone: true }).notNull(),
  strategy: text("strategy"),
  status: text("status").default("open").notNull(),
});

export const settlementCycles = pgTable("settlement_cycles", {
  id: text("id").primaryKey(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const settlementLines = pgTable(
  "settlement_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: text("cycle_id")
      .notNull()
      .references(() => settlementCycles.id),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    displayName: text("display_name").notNull(),
    usdtWalletTrc20: text("usdt_wallet_trc20").notNull(),
    tradingNetUsdt: numeric("trading_net_usdt", { precision: 24, scale: 8 }).default("0").notNull(),
    referralCommissionsUsdt: numeric("referral_commissions_usdt", { precision: 24, scale: 8 })
      .default("0")
      .notNull(),
    performanceFeeUsdt: numeric("performance_fee_usdt", { precision: 24, scale: 8 })
      .default("0")
      .notNull(),
    platformFeesUsdt: numeric("platform_fees_usdt", { precision: 24, scale: 8 })
      .default("0")
      .notNull(),
    adjustmentsUsdt: numeric("adjustments_usdt", { precision: 24, scale: 8 }).default("0").notNull(),
    totalDueUsdt: numeric("total_due_usdt", { precision: 24, scale: 8 }).notNull(),
    ledgerVerified: boolean("ledger_verified").default(false).notNull(),
    status: settlementStatusEnum("status").default("pending").notNull(),
    payoutTx: text("payout_tx"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("settlement_cycle_account").on(t.cycleId, t.accountId)],
);

export const treasuryDepositsObserved = pgTable("treasury_deposits_observed", {
  txHash: text("tx_hash").primaryKey(),
  fromAddress: text("from_address"),
  amountUsdt: numeric("amount_usdt", { precision: 24, scale: 8 }).notNull(),
  blockTimestamp: numeric("block_timestamp", { precision: 20, scale: 0 }),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trc20Deposits = pgTable("trc20_deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  txHash: text("tx_hash").notNull().unique(),
  amountUsdt: numeric("amount_usdt", { precision: 24, scale: 8 }).notNull(),
  purpose: text("purpose").notNull(), // license | topup
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const referralEvents = pgTable("referral_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  beneficiaryAccountId: uuid("beneficiary_account_id")
    .notNull()
    .references(() => accounts.id),
  sourceAccountId: uuid("source_account_id")
    .notNull()
    .references(() => accounts.id),
  level: numeric("level", { precision: 2, scale: 0 }).notNull(),
  commissionUsdt: numeric("commission_usdt", { precision: 24, scale: 8 }).notNull(),
  cycleId: text("cycle_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const depositAddressPool = pgTable("deposit_address_pool", {
  address: text("address").primaryKey(),
  derivationIndex: numeric("derivation_index", { precision: 12, scale: 0 }),
  accountId: uuid("account_id").references(() => accounts.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
});

/** Singleton counter for BIP44 m/44'/195'/0'/0/n deposit addresses */
export const depositHdState = pgTable("deposit_hd_state", {
  id: numeric("id", { precision: 1, scale: 0 }).primaryKey().default("1"),
  nextDerivationIndex: numeric("next_derivation_index", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const indexerCursors = pgTable("indexer_cursors", {
  address: text("address").primaryKey(),
  lastSeenMs: numeric("last_seen_ms", { precision: 20, scale: 0 }).default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const botConfigs = pgTable("bot_configs", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id),
  mode: botModeEnum("mode").default("paper").notNull(),
  status: botStatusEnum("status").default("stopped").notNull(),
  riskLevel: text("risk_level").default("balanced").notNull(),
  maxCapitalUsdt: numeric("max_capital_usdt", { precision: 24, scale: 8 }).default("1000"),
  maxTradeSizeUsdt: numeric("max_trade_size_usdt", { precision: 24, scale: 8 }).default("100"),
  maxDailyLossUsdt: numeric("max_daily_loss_usdt", { precision: 24, scale: 8 }).default("50"),
  minExpectedProfitUsdt: numeric("min_expected_profit_usdt", { precision: 24, scale: 8 }).default(
    "5",
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  tier: text("tier").default("licensed").notNull(),
  status: text("status").default("active").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id),
  chainId: numeric("chain_id", { precision: 6, scale: 0 }).default("1").notNull(),
  strategy: text("strategy").notNull(),
  expectedGrossUsdt: numeric("expected_gross_usdt", { precision: 24, scale: 8 }),
  expectedNetUsdt: numeric("expected_net_usdt", { precision: 24, scale: 8 }),
  executeScore: numeric("execute_score", { precision: 5, scale: 4 }),
  payload: jsonb("payload").default({}).notNull(),
  detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow().notNull(),
});

export const executions = pgTable("executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  mode: botModeEnum("mode").notNull(),
  strategy: text("strategy").notNull(),
  grossUsdt: numeric("gross_usdt", { precision: 24, scale: 8 }),
  gasUsdt: numeric("gas_usdt", { precision: 24, scale: 8 }),
  feesUsdt: numeric("fees_usdt", { precision: 24, scale: 8 }),
  netUsdt: numeric("net_usdt", { precision: 24, scale: 8 }),
  status: text("status").notNull(),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  accountId: uuid("account_id"),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  scopes: text("scopes").array().default(["read", "trade"]).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});
