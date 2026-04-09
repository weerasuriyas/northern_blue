# Database Cache Architecture Plan

## Status Legend
- ⬜ Not started
- 🔄 In progress
- ✅ Complete

---

## Overview

Shopify is the **source of truth** for all commerce data. Our Postgres database acts as a **read cache and extension layer** — fast reads for the admin UI, custom tables for data Shopify doesn't own, and a place to run cross-table queries and reports.

```
Shopify (source of truth)
    ↕  webhooks (push) + Admin API (pull on demand)
Our Postgres DB (cache + extensions)
    ↕
Next.js API routes
  reads  → always hit DB (fast, no rate limits)
  writes → Shopify first, then update DB to match
```

---

## Table Ownership

| Table | Owner | Sync Strategy |
|---|---|---|
| `customers` | Shopify | Webhook `customers/create` + `customers/update` |
| `orders` | Shopify | Webhook `orders/create` + `orders/updated` |
| `inventory` | Shopify | Webhook `inventory_levels/update` |
| `discounts` | Shopify | No webhook — scheduled poll or manual sync |
| `revenue` | Derived | Recalculated from orders on each order webhook |
| `suppliers` | Ours | No sync — we own this entirely |
| `returns` | Ours | Local workflow; calls Shopify Refunds API on `refunded` |
| `settings` | Ours | No sync — app-level config |

**Products are not stored in our DB.** They are queried directly from the Shopify Storefront API at request time.

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

---

## Environment Variables Needed

```env
# Already have:
DATABASE_URL=postgresql://northern_blue:northern_blue@localhost:5432/northern_blue
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
