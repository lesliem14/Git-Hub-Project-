ALTER TABLE "deposit_address_pool" ADD COLUMN IF NOT EXISTS "derivation_index" integer;

CREATE UNIQUE INDEX IF NOT EXISTS "deposit_address_pool_derivation_index_unique"
  ON "deposit_address_pool" ("derivation_index")
  WHERE "derivation_index" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "deposit_hd_state" (
  "id" smallint PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
  "next_derivation_index" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "deposit_hd_state" ("id", "next_derivation_index") VALUES (1, 0)
ON CONFLICT ("id") DO NOTHING;
