ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;

ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "deposit_address_trc20" text;

CREATE TABLE IF NOT EXISTS "deposit_address_pool" (
  "address" text PRIMARY KEY NOT NULL,
  "account_id" uuid REFERENCES "accounts"("id"),
  "assigned_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "indexer_cursors" (
  "address" text PRIMARY KEY NOT NULL,
  "last_seen_ms" bigint NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_deposit_address_unique" ON "accounts" ("deposit_address_trc20");
