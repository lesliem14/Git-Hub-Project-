-- Agentra core schema (PostgreSQL 15+)

CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE bot_mode AS ENUM ('paper', 'live');
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'paid', 'failed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  evm_address TEXT,
  usdt_trc20_payout TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  features JSONB NOT NULL DEFAULT '{}',
  max_daily_executions INT NOT NULL DEFAULT 0,
  allowed_chains TEXT[] NOT NULL DEFAULT '{}',
  allowed_strategies TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bot_configs (
  account_id UUID PRIMARY KEY REFERENCES accounts(id),
  mode bot_mode NOT NULL DEFAULT 'paper',
  status TEXT NOT NULL DEFAULT 'stopped',
  risk_level TEXT NOT NULL DEFAULT 'balanced',
  max_capital_usdt NUMERIC(24, 8),
  max_trade_size_usdt NUMERIC(24, 8),
  max_daily_loss_usdt NUMERIC(24, 8),
  min_expected_profit_usdt NUMERIC(24, 8),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INT NOT NULL,
  strategy TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_gross_usdt NUMERIC(24, 8),
  expected_net_usdt NUMERIC(24, 8),
  payload JSONB NOT NULL
);

CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id),
  success BOOLEAN,
  gas_usdt NUMERIC(24, 8),
  slippage_usdt NUMERIC(24, 8),
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  opportunity_id UUID REFERENCES opportunities(id),
  tx_hash TEXT,
  mode bot_mode NOT NULL,
  gross_usdt NUMERIC(24, 8),
  net_usdt NUMERIC(24, 8),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settlement_cycles (
  id TEXT PRIMARY KEY, -- YYYY-MM-DD UTC
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ
);

CREATE TABLE settlement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL REFERENCES settlement_cycles(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  trading_net_usdt NUMERIC(24, 8) NOT NULL DEFAULT 0,
  referral_commissions_usdt NUMERIC(24, 8) NOT NULL DEFAULT 0,
  platform_fees_usdt NUMERIC(24, 8) NOT NULL DEFAULT 0,
  adjustments_usdt NUMERIC(24, 8) NOT NULL DEFAULT 0,
  total_due_usdt NUMERIC(24, 8) NOT NULL,
  status settlement_status NOT NULL DEFAULT 'pending',
  payout_tx TEXT,
  UNIQUE (cycle_id, account_id)
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_executions_account_created ON executions(account_id, created_at DESC);
CREATE INDEX idx_settlement_lines_cycle ON settlement_lines(cycle_id, status);
