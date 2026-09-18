CREATE TYPE "public"."settlement_status" AS ENUM('pending', 'processing', 'paid', 'failed');
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"evm_address" text,
	"usdt_trc20_payout" text,
	"referral_code" text,
	"referred_by_account_id" uuid,
	"license_activated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_referral_code_unique" UNIQUE("referral_code")
);
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" uuid,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "ledger_accounts" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"available_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"license_credit_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"locked_in_trade_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"pending_withdrawable_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "referral_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beneficiary_account_id" uuid NOT NULL,
	"source_account_id" uuid NOT NULL,
	"level" numeric(2, 0) NOT NULL,
	"commission_usdt" numeric(24, 8) NOT NULL,
	"cycle_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "settlement_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone
);
CREATE TABLE "settlement_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"usdt_wallet_trc20" text NOT NULL,
	"trading_net_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"referral_commissions_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"performance_fee_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"platform_fees_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"adjustments_usdt" numeric(24, 8) DEFAULT '0' NOT NULL,
	"total_due_usdt" numeric(24, 8) NOT NULL,
	"ledger_verified" boolean DEFAULT false NOT NULL,
	"status" "settlement_status" DEFAULT 'pending' NOT NULL,
	"payout_tx" text,
	"paid_at" timestamp with time zone
);
CREATE TABLE "trade_locks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"amount_usdt" numeric(24, 8) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"releases_at" timestamp with time zone NOT NULL,
	"strategy" text,
	"status" text DEFAULT 'open' NOT NULL
);
CREATE TABLE "trc20_deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"tx_hash" text NOT NULL,
	"amount_usdt" numeric(24, 8) NOT NULL,
	"purpose" text NOT NULL,
	"confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trc20_deposits_tx_hash_unique" UNIQUE("tx_hash")
);
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_beneficiary_account_id_accounts_id_fk" FOREIGN KEY ("beneficiary_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_source_account_id_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_cycle_id_settlement_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."settlement_cycles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "trade_locks" ADD CONSTRAINT "trade_locks_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "trc20_deposits" ADD CONSTRAINT "trc20_deposits_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
CREATE UNIQUE INDEX "settlement_cycle_account" ON "settlement_lines" USING btree ("cycle_id","account_id");
