-- Northern Blue database schema (MySQL 8)
-- Mirrors Shopify REST Admin API (2024-10) field names and types wherever possible.
-- Runs automatically on first `docker compose up`.

CREATE TABLE IF NOT EXISTS customers (
  id                VARCHAR(64)   NOT NULL,
  email             VARCHAR(255)  NOT NULL,
  first_name        VARCHAR(128)  NOT NULL,
  last_name         VARCHAR(128)  NOT NULL,
  phone             VARCHAR(32)   DEFAULT NULL,
  verified_email    TINYINT(1)    DEFAULT 1,
  state             VARCHAR(32)   DEFAULT 'enabled',
  tags              VARCHAR(512)  DEFAULT '',
  note              TEXT,
  tax_exempt        TINYINT(1)    DEFAULT 0,
  orders_count      INT           DEFAULT 0,
  total_spent       DECIMAL(10,2) DEFAULT 0,
  last_order_id     VARCHAR(64)   DEFAULT NULL,
  last_order_name   VARCHAR(64)   DEFAULT NULL,
  city              VARCHAR(128)  DEFAULT NULL,
  province          VARCHAR(64)   DEFAULT NULL,
  created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id                  VARCHAR(64)   NOT NULL,
  name                VARCHAR(64)   NOT NULL,
  order_number        INT           DEFAULT NULL,
  customer_id         VARCHAR(64)   DEFAULT NULL,
  customer_name       VARCHAR(255)  DEFAULT NULL,
  customer_email      VARCHAR(255)  DEFAULT NULL,
  phone               VARCHAR(32)   DEFAULT NULL,
  line_items          JSON          NOT NULL,
  subtotal_price      DECIMAL(10,2) DEFAULT NULL,
  total_price         DECIMAL(10,2) DEFAULT NULL,
  total_tax           DECIMAL(10,2) DEFAULT 0,
  taxes_included      TINYINT(1)    DEFAULT 0,
  currency_code       VARCHAR(8)    DEFAULT 'CAD',
  fulfillment_status  VARCHAR(32)   DEFAULT 'unfulfilled',
  financial_status    VARCHAR(32)   DEFAULT 'pending',
  shipping_address    JSON          DEFAULT NULL,
  billing_address     JSON          DEFAULT NULL,
  timeline            JSON          DEFAULT (JSON_ARRAY()),
  note                TEXT,
  tags                VARCHAR(512)  DEFAULT '',
  cancelled_at        DATETIME      DEFAULT NULL,
  cancel_reason       VARCHAR(64)   DEFAULT NULL,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_customer (customer_id),
  KEY idx_orders_created  (created_at),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fulfillments (
  id                  VARCHAR(64)   NOT NULL,
  order_id            VARCHAR(64)   DEFAULT NULL,
  name                VARCHAR(64)   DEFAULT NULL,
  status              VARCHAR(32)   DEFAULT 'success',
  shipment_status     VARCHAR(32)   DEFAULT NULL,
  service             VARCHAR(64)   DEFAULT 'manual',
  tracking_number     VARCHAR(128)  DEFAULT NULL,
  tracking_numbers    JSON          DEFAULT (JSON_ARRAY()),
  tracking_company    VARCHAR(64)   DEFAULT NULL,
  tracking_url        VARCHAR(512)  DEFAULT NULL,
  tracking_urls       JSON          DEFAULT (JSON_ARRAY()),
  line_items          JSON          NOT NULL,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fulfillments_order (order_id),
  CONSTRAINT fk_fulfillments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory (
  id                  VARCHAR(64)   NOT NULL,
  inventory_item_id   VARCHAR(128)  DEFAULT NULL,
  location_id         VARCHAR(64)   DEFAULT 'primary',
  product_title       VARCHAR(255)  NOT NULL,
  variant_title       VARCHAR(64)   DEFAULT NULL,
  available           INT           DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
  id                  VARCHAR(64)   NOT NULL,
  name                VARCHAR(255)  NOT NULL,
  contact_name        VARCHAR(255)  DEFAULT NULL,
  contact_email       VARCHAR(255)  DEFAULT NULL,
  phone               VARCHAR(32)   DEFAULT NULL,
  country             VARCHAR(64)   DEFAULT NULL,
  lead_time_days      INT           DEFAULT 7,
  integration_type    VARCHAR(32)   DEFAULT 'manual',
  api_endpoint        VARCHAR(512)  DEFAULT NULL,
  api_key             VARCHAR(255)  DEFAULT NULL,
  active              TINYINT(1)    DEFAULT 1,
  notes               TEXT,
  product_count       INT           DEFAULT 0,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discounts (
  id                  VARCHAR(64)   NOT NULL,
  code                VARCHAR(64)   NOT NULL,
  type                VARCHAR(32)   NOT NULL,
  value               DECIMAL(10,2) DEFAULT 0,
  min_order_amount    DECIMAL(10,2) DEFAULT 0,
  usage_limit         INT           DEFAULT NULL,
  usage_count         INT           DEFAULT 0,
  starts_at           DATE          DEFAULT NULL,
  expires_at          DATE          DEFAULT NULL,
  active              TINYINT(1)    DEFAULT 1,
  summary             VARCHAR(255)  DEFAULT NULL,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_discounts_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `returns` (
  id                  VARCHAR(64)   NOT NULL,
  order_id            VARCHAR(64)   DEFAULT NULL,
  order_name          VARCHAR(64)   DEFAULT NULL,
  customer_id         VARCHAR(64)   DEFAULT NULL,
  customer_name       VARCHAR(255)  DEFAULT NULL,
  customer_email      VARCHAR(255)  DEFAULT NULL,
  requested_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  reason              TEXT,
  items               JSON          NOT NULL,
  refund_amount       DECIMAL(10,2) DEFAULT NULL,
  currency_code       VARCHAR(8)    DEFAULT 'CAD',
  status              VARCHAR(32)   DEFAULT 'requested',
  timeline            JSON          DEFAULT (JSON_ARRAY()),
  notes               TEXT,
  PRIMARY KEY (id),
  KEY idx_returns_order    (order_id),
  KEY idx_returns_customer (customer_id),
  CONSTRAINT fk_returns_order    FOREIGN KEY (order_id)    REFERENCES orders(id),
  CONSTRAINT fk_returns_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
  id                  VARCHAR(64)   NOT NULL,
  title               VARCHAR(255)  NOT NULL,
  handle              VARCHAR(191)  NOT NULL,
  description         TEXT,
  image               VARCHAR(512)  DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_collections_handle (handle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id                  VARCHAR(64)   NOT NULL,
  title               VARCHAR(255)  NOT NULL,
  handle              VARCHAR(191)  NOT NULL,
  description         TEXT,
  vendor              VARCHAR(255)  DEFAULT NULL,
  product_type        VARCHAR(64)   DEFAULT NULL,
  status              VARCHAR(32)   DEFAULT 'active',
  tags                VARCHAR(512)  DEFAULT '',
  collection_handle   VARCHAR(191)  DEFAULT NULL,
  supplier_id         VARCHAR(64)   DEFAULT NULL,
  price_min           DECIMAL(10,2) DEFAULT NULL,
  currency_code       VARCHAR(8)    DEFAULT 'CAD',
  images              JSON          DEFAULT (JSON_ARRAY()),
  options             JSON          DEFAULT (JSON_ARRAY()),
  variants            JSON          DEFAULT (JSON_ARRAY()),
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at        DATETIME      DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_handle (handle),
  KEY idx_products_collection (collection_handle),
  KEY idx_products_supplier   (supplier_id),
  CONSTRAINT fk_products_collection FOREIGN KEY (collection_handle) REFERENCES collections(handle),
  CONSTRAINT fk_products_supplier   FOREIGN KEY (supplier_id)       REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supplier_orders (
  id                  VARCHAR(64)   NOT NULL,
  order_id            VARCHAR(64)   DEFAULT NULL,
  order_name          VARCHAR(64)   DEFAULT NULL,
  supplier_id         VARCHAR(64)   DEFAULT NULL,
  supplier_name       VARCHAR(255)  DEFAULT NULL,
  items               JSON          NOT NULL,
  shipping_address    JSON          DEFAULT NULL,
  status              VARCHAR(32)   DEFAULT 'pending',
  reference           VARCHAR(64)   DEFAULT NULL,
  notes               TEXT,
  tracking_number     VARCHAR(128)  DEFAULT NULL,
  tracking_company    VARCHAR(64)   DEFAULT NULL,
  sent_at             DATETIME      DEFAULT CURRENT_TIMESTAMP,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_supplier_orders_order    (order_id),
  KEY idx_supplier_orders_supplier (supplier_id),
  CONSTRAINT fk_supplier_orders_order    FOREIGN KEY (order_id)    REFERENCES orders(id),
  CONSTRAINT fk_supplier_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS revenue (
  date                DATE          NOT NULL,
  amount              DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key`               VARCHAR(64)   NOT NULL,
  `value`             TEXT          NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('store_name', 'Northern Blue'),
  ('email',      'admin@northernblue.ca'),
  ('currency',   'CAD'),
  ('timezone',   'America/Toronto'),
  ('country',    'Canada');
