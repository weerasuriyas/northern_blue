-- Northern Blue database schema
-- Runs automatically on first `docker compose up`

CREATE TABLE IF NOT EXISTS customers (
  id            TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  city          TEXT,
  province      TEXT,
  orders_count  INTEGER DEFAULT 0,
  total_spent   NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  customer_id        TEXT REFERENCES customers(id),
  customer_name      TEXT,
  customer_email     TEXT,
  line_items         JSONB NOT NULL DEFAULT '[]',
  subtotal_price     NUMERIC(10,2),
  total_price        NUMERIC(10,2),
  currency_code      TEXT DEFAULT 'CAD',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  financial_status   TEXT DEFAULT 'pending',
  shipping_address   JSONB,
  timeline           JSONB NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id             TEXT PRIMARY KEY,
  product_title  TEXT NOT NULL,
  variant_title  TEXT,
  available      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS suppliers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  contact_name     TEXT,
  contact_email    TEXT,
  phone            TEXT,
  country          TEXT,
  lead_time_days   INTEGER DEFAULT 7,
  integration_type TEXT DEFAULT 'manual',
  api_endpoint     TEXT,
  api_key          TEXT,
  active           BOOLEAN DEFAULT TRUE,
  notes            TEXT,
  product_count    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discounts (
  id               TEXT PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL,
  value            NUMERIC(10,2) DEFAULT 0,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  usage_limit      INTEGER,
  usage_count      INTEGER DEFAULT 0,
  starts_at        DATE,
  expires_at       DATE,
  active           BOOLEAN DEFAULT TRUE,
  summary          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS returns (
  id             TEXT PRIMARY KEY,
  order_id       TEXT REFERENCES orders(id),
  order_name     TEXT,
  customer_id    TEXT REFERENCES customers(id),
  customer_name  TEXT,
  customer_email TEXT,
  requested_at   TIMESTAMPTZ DEFAULT NOW(),
  reason         TEXT,
  items          JSONB NOT NULL DEFAULT '[]',
  refund_amount  NUMERIC(10,2),
  currency_code  TEXT DEFAULT 'CAD',
  status         TEXT DEFAULT 'requested',
  timeline       JSONB NOT NULL DEFAULT '[]',
  notes          TEXT
);

CREATE TABLE IF NOT EXISTS revenue (
  date    DATE PRIMARY KEY,
  amount  NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('store_name', 'Northern Blue'),
  ('email',      'admin@northernblue.ca'),
  ('currency',   'CAD'),
  ('timezone',   'America/Toronto'),
  ('country',    'Canada')
ON CONFLICT (key) DO NOTHING;
