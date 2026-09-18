CREATE TABLE IF NOT EXISTS "treasury_deposits_observed" (
  "tx_hash" text PRIMARY KEY NOT NULL,
  "from_address" text,
  "amount_usdt" numeric(24, 8) NOT NULL,
  "block_timestamp" bigint,
  "indexed_at" timestamp with time zone DEFAULT now() NOT NULL
);
