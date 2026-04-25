# Database Cache Architecture Plan

## Status Legend
- ⬜ Not started
- 🔄 In progress
- ✅ Complete

---

## Overview

Shopify is the **source of truth** for all commerce data. Our MySQL database acts as a **read cache and extension layer** — fast reads for the admin UI, custom tables for data Shopify doesn't own, and a place to run cross-table queries and reports.

```
Shopify (source of truth)
    ↕  webhooks (push) + Admin API (pull on demand)
Our MySQL DB (cache + extensions)
    ↕
Next.js API routes
  reads  → always hit DB (fast, no rate limits)
  writes → Shopify first, then update DB to match
```

---

## Table Ownership

| Table | Owner | Sync Strategy | Shopify equivalent |
|---|---|---|---|
| `customers` | Shopify | Webhook `customers/create` + `customers/update` | Customer object |
| `orders` | Shopify | Webhook `orders/create` + `orders/updated` | Order object |
| `fulfillments` | Shopify | Webhook `fulfillments/create` + `fulfillments/update` | Fulfillment object |
| `inventory` | Shopify | Webhook `inventory_levels/update` | InventoryLevel object |
| `products` | Shopify (cached) | Webhook `products/create` + `products/update` | Product + ProductVariant |
| `collections` | Shopify (cached) | Manual sync or webhooks | Collection object |
| `discounts` | Shopify | No webhook — scheduled poll or manual sync | PriceRule + DiscountCode |
| `revenue` | Derived | Recalculated from orders on each order webhook | — |
| `suppliers` | Ours | No sync — we own this entirely | — |
| `supplier_orders` | Ours | No sync — internal PO tracking | — |
| `returns` | Ours | Local workflow; calls Shopify Refunds API on `refunded` | Return + Refund |
| `settings` | Ours | No sync — app-level config | — |

## Schema Alignment with Shopify REST Admin API (2024-10)

All Shopify-owned tables mirror the exact field names and types from the Shopify REST Admin API. Key alignment decisions:

### Field naming
- snake_case throughout (matches Shopify REST, not GraphQL)
- Price fields stored as `DECIMAL(10,2)` (Shopify returns strings, we parse on ingest; mysql2 returns DECIMAL as string by default — same behaviour as the previous Postgres `NUMERIC`)
- Timestamps stored as `DATETIME` (Shopify sends ISO 8601 — strip the trailing `Z` before insert; the seed/sync helpers do this in `dt(iso)`)
- IDs stored as `VARCHAR(64)` to hold Shopify GIDs (`gid://shopify/Order/12345`)
- `returns` is a MySQL reserved word — backtick everywhere it appears in SQL
- `key`/`value` columns on `settings` likewise need backticks

### JSON columns
These fields are stored as-is from Shopify to avoid schema churn when Shopify adds sub-fields. They were `JSONB` under Postgres; under MySQL they're plain `JSON` — read shape is identical (mysql2 parses JSON columns to JS objects on the way out).

| Table | JSON column | Shopify shape |
|---|---|---|
| `orders` | `line_items` | `[{id, product_id, variant_id, title, variant_title, name, sku, vendor, quantity, current_quantity, price, fulfillment_status, requires_shipping, taxable, gift_card}]` |
| `orders` | `shipping_address` | `{name, first_name, last_name, address1, address2, city, province, province_code, zip, country, country_code, phone, company}` |
| `orders` | `billing_address` | Same shape as shipping_address |
| `orders` | `timeline` | `[{at, message}]` — internal event log; appended via `JSON_MERGE_PRESERVE(timeline, CAST(? AS JSON))` |
| `products` | `variants` | `[{id, product_id, title, sku, price, compare_at_price, inventory_item_id, inventory_quantity, inventory_management, inventory_policy, option1-3, weight, weight_unit, barcode, requires_shipping, taxable, position}]` |
| `products` | `options` | `[{id, name, position, values[]}]` e.g. `[{name:"Size", values:["1X","2X","3X","4X"]}]` |
| `fulfillments` | `line_items` | Subset of order line_items covered by this fulfillment |
| `returns` | `items`, `timeline` | Items being returned; status timeline appended via `JSON_MERGE_PRESERVE` |
| `supplier_orders` | `items`, `shipping_address` | What was forwarded to the supplier and where to ship it |

### MySQL-specific patterns

| Need | Postgres | MySQL |
|---|---|---|
| Upsert | `ON CONFLICT (id) DO UPDATE SET col = EXCLUDED.col` | `ON DUPLICATE KEY UPDATE col = VALUES(col)` |
| Append to JSON array | `timeline = timeline \|\| $2::jsonb` | `timeline = JSON_MERGE_PRESERVE(timeline, CAST(? AS JSON))` |
| Format ISO timestamp | `to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')` | `DATE_FORMAT(ts, '%Y-%m-%dT%H:%i:%sZ')` |
| Start of month | `date_trunc('month', CURRENT_DATE)` | `DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')` |
| Flatten JSON array to rows | `jsonb_array_elements(o.line_items) AS li` | `JSON_TABLE(o.line_items, '$[*]' COLUMNS (...)) AS li` |
| Aggregate to JSON array | `json_agg(jsonb_build_object(...))` | `JSON_ARRAYAGG(JSON_OBJECT(...))` |
| Cast for client | `value::float`, `total_spent::text` | `CAST(value AS DOUBLE)`; DECIMAL already comes back as string — no cast needed |
| Placeholders | `$1, $2, ...` (kept in app code; reused) | `?, ?, ...` — `lib/db.js` translates `$N → ?` so call sites are unchanged. Each `$N` is sent once; pass duplicates if a query references the same value twice (see `deriveRevenue`). |

### Notable differences from Shopify
- `fulfillment_status` — Shopify uses `null` for unfulfilled; we use `'unfulfilled'` to avoid null checks
- `supplier_id` on `products` — custom column for our dropship routing; not in Shopify
- `timeline` on `orders` — custom column for internal event log; not in Shopify (Shopify has Order Events)

---

## Sync Architecture

### Webhook handler — the sync engine

One endpoint handles all Shopify push events:

```
POST /api/webhooks/shopify
  1. Verify HMAC-SHA256 signature (reject if invalid)
  2. Read X-Shopify-Topic header
  3. Route to the right upsert handler
  4. Return 200 immediately (Shopify retries on non-2xx)
```

Topics to handle:

| Topic | Action |
|---|---|
| `orders/create` | Upsert order row, upsert customer row, recalculate revenue for that date |
| `orders/updated` | Upsert order row (fulfillment status, financial status, timeline) |
| `customers/create` | Upsert customer row |
| `customers/update` | Upsert customer row |
| `inventory_levels/update` | Upsert inventory row by `inventory_item_id` |

### Bulk sync script — `npm run db:sync`

For first boot, after downtime, or manual refresh. Calls Shopify Admin API and bulk-upserts everything:

```
db:sync
  → sync:customers   (GET /admin/api/customers.json, paginated)
  → sync:orders      (GET /admin/api/orders.json?status=any, paginated)
  → sync:inventory   (GET /admin/api/inventory_levels.json, paginated)
  → sync:discounts   (GET /admin/api/price_rules.json + discount_codes, paginated)
  → derive:revenue   (aggregate order totals by day)
```

---

## Write Flow

When the admin UI creates or updates data:

| Action | Write path |
|---|---|
| Create discount | POST Shopify Price Rules API → on success, upsert our DB |
| Toggle discount | PUT Shopify Price Rules API → upsert our DB |
| Fulfill order | POST Shopify Fulfillments API → webhook fires → DB updates automatically |
| Issue refund | POST Shopify Refunds API → update `returns` status to `refunded` in our DB |
| Add supplier | Write only to our DB (Shopify has no supplier concept) |

---

## Cache Invalidation Edge Cases

| Scenario | Handling |
|---|---|
| Missed webhooks (server downtime) | Shopify retries for 48h. Beyond that, run `npm run db:sync` manually. |
| Discounts (no webhook) | Poll Shopify on a schedule, or invalidate on admin UI save via API call. |
| First go-live | Run `npm run db:sync` before opening the store. |
| DB wiped | Run `npm run db:sync` to rebuild from Shopify. Suppliers/returns/settings must be re-seeded separately. |

---

## Files to Build

### Phase A — Webhook handler ✅

| File | What it does |
|---|---|
| `app/api/webhooks/shopify/route.js` | Receives all Shopify webhooks, verifies HMAC, routes by topic |
| `lib/sync.js` | Upsert functions: `syncOrder`, `syncCustomer`, `syncInventoryLevel`, `deriveRevenue` |

### Phase B — Bulk sync script ✅

| File | What it does |
|---|---|
| `db/sync.js` | CLI script: pulls all pages from Shopify Admin API and upserts into DB |

### Phase C — Write-through on admin actions ⬜

| File | Change |
|---|---|
| `app/api/admin/[...path]/route.js` | Discount create/toggle: call Shopify API before writing to DB |
| `app/api/admin/[...path]/route.js` | Return refund action: call Shopify Refunds API, then update `returns` table |
| `app/api/admin/[...path]/route.js` | Fulfillment mark: call Shopify Fulfillments API → webhook updates DB automatically |

### Phase D — Shopify schema alignment ✅ (April 2026)

Enriched all seed data and DB schema to mirror Shopify REST Admin API field names exactly:

- `orders`: added `order_number`, `phone`, `billing_address`, `total_tax`, `taxes_included`, `note`, `tags`, `updated_at`, `cancelled_at`, `cancel_reason`, `timeline`
- `customers`: added `phone`, `state`, `note`, `tags`, `tax_exempt`, `verified_email`, `updated_at`, `last_order_id`, `last_order_name`
- `products`: added `vendor`, `product_type`, `status`, `tags`, `options`, `updated_at`, `published_at`
- `inventory`: added `inventory_item_id` (links to `ProductVariant.inventory_item_id`), `location_id`
- New `fulfillments` table with full Shopify Fulfillment shape (tracking, shipment_status, line_items)
- Line items JSON enriched: `id`, `product_id`, `variant_id`, `name`, `sku`, `vendor`, `current_quantity`, `fulfillment_status`, `requires_shipping`, `taxable`
- Product variants JSON enriched: `sku`, `compare_at_price`, `inventory_item_id`, `inventory_management`, `inventory_policy`, `weight`, `barcode`, `option1-3`
- Supplier orders JSON enriched: `sku` per item, full address with `province_code`, `country_code`, `phone`

### Phase E — Postgres → MySQL migration ✅ (April 2026)

- Replaced `pg` with `mysql2/promise`; `lib/db.js` exposes the same `{ rows }` shape and translates pg-style `$N` placeholders to mysql2's `?`
- Schema rewritten for MySQL 8/9 with explicit `FOREIGN KEY` constraints (InnoDB ignores inline `REFERENCES`)
- All `ON CONFLICT … DO UPDATE` rewritten as `ON DUPLICATE KEY UPDATE … VALUES(col)`
- Postgres-only SQL in `app/api/admin/[...path]/route.js` rewritten: `JSON_TABLE` for line-item flattening, `JSON_ARRAYAGG` + `JSON_OBJECT` for nested aggregation, `JSON_MERGE_PRESERVE` for timeline appends, `DATE_FORMAT` for `to_char`, `CAST(... AS DOUBLE)` for `::float`
- Seed runs with `FOREIGN_KEY_CHECKS = 0` so the existing insert order (products before suppliers) still works without reordering
- Docker image switched to `mysql:latest` on port 3306; `mysql2` flagged as `serverExternalPackages` so webpack/Turbopack don't try to bundle Node-only socket code into the client
- `lib/db.js` imports `'server-only'` to fail fast if a client component ever tries to pull DB code in

---

## Environment Variables Needed

```env
# Already have:
DATABASE_URL=mysql://northern_blue:northern_blue@localhost:3306/northern_blue
ADMIN_JWT_SECRET=...

# Need to add when wiring up Shopify:
SHOPIFY_WEBHOOK_SECRET=        # from Shopify admin → Settings → Notifications → Webhooks
SHOPIFY_ADMIN_API_TOKEN=       # shpat_... from Shopify admin → Apps → private app
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=
```

---

## Build Order

1. **Phase A — Webhook handler** — builds the live sync pipeline. Nothing else depends on it being perfect yet since we have mock data, but it unblocks real Shopify testing.
2. **Phase B — Bulk sync script** — needed for go-live. Can be done in parallel with Phase A.
3. **Phase C — Write-through** — needed before going live with discounts or refunds. Lower priority while still on mock data.

---

## What This Buys Us

- Admin panel reads are fast — no Shopify API latency, no rate limit concerns
- Supplier forwarding logic runs off the webhook, not the UI — order comes in, DB is updated, forwarding fires automatically
- Returns workflow is entirely local — only touches Shopify when issuing the actual refund
- Easy to add full-text search, custom reports, and cross-table queries (e.g. all unfulfilled orders from a given supplier)
- DB wipe is recoverable — just re-run `db:sync`
