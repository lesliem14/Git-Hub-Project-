CREATE TYPE bot_mode AS ENUM ('paper', 'live');
CREATE TYPE bot_status AS ENUM ('running', 'stopped', 'paused');

CREATE TABLE IF NOT EXISTS bot_configs (
  account_id uuid PRIMARY KEY REFERENCES accounts(id),
  mode bot_mode NOT NULL DEFAULT 'paper',
  status bot_status NOT NULL DEFAULT 'stopped',
  risk_level text NOT NULL DEFAULT 'balanced',
  max_capital_usdt numeric(24, 8) DEFAULT 1000,
  max_trade_size_usdt numeric(24, 8) DEFAULT 100,
  max_daily_loss_usdt numeric(24, 8) DEFAULT 50,
  min_expected_profit_usdt numeric(24, 8) DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  tier text NOT NULL DEFAULT 'licensed',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id),
  chain_id int NOT NULL DEFAULT 1,
  strategy text NOT NULL,
  expected_gross_usdt numeric(24, 8),
  expected_net_usdt numeric(24, 8),
  execute_score numeric(5, 4),
  payload jsonb NOT NULL DEFAULT '{}',
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  mode bot_mode NOT NULL,
  strategy text NOT NULL,
  gross_usdt numeric(24, 8),
  gas_usdt numeric(24, 8),
  fees_usdt numeric(24, 8),
  net_usdt numeric(24, 8),
  status text NOT NULL,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_account ON opportunities(account_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_account ON executions(account_id, created_at DESC);
