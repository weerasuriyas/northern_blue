# Northern Blue

Plus-size women's clothing brand. Built with Next.js 15, Tailwind CSS, MySQL, and Shopify (storefront + admin).

## Stack

- **Framework:** Next.js 15 (App Router, SSR)
- **Styling:** Tailwind CSS 3
- **Database:** MySQL 9 (Docker) — cache + extension layer
- **E-commerce:** Shopify Storefront API (cart, checkout) + Shopify Admin API (orders, products, customers)
- **Auth:** JWT via httpOnly cookie + bcrypt password hashing (admin panel)
- **Testing:** Vitest + Testing Library (36 tests)

## Getting Started

### 1. Start the database

```bash
docker compose up -d   # starts mysql:latest on port 3306
npm run db:seed        # populate all tables with dev data
```

### 2. Set environment variables

```bash
cp .env.example .env.local
# fill in ADMIN_JWT_SECRET and ADMIN_PASSWORD_HASH at minimum (see below)
```

### 3. Run the dev server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Admin panel:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Username: `admin` / Password: `admin123` *(change before production — see Settings)*

---

## Database

All application data lives in MySQL. The DB is the **cache layer** — Shopify is the source of truth for commerce data, and our DB stays in sync via webhooks.

### Tables

| Table | Owner | Description |
|---|---|---|
| `products` | Shopify → DB | 12 products across 4 collections |
| `collections` | Shopify → DB | Spring Collection, Everyday Essentials, Workwear Edit, Weekend Casual |
| `customers` | Shopify → DB | Synced via `customers/create` + `customers/update` webhooks |
| `orders` | Shopify → DB | Synced via `orders/create` + `orders/updated` webhooks |
| `inventory` | Shopify → DB | Synced via `inventory_levels/update` webhook |
| `discounts` | Shopify → DB | Polled from Shopify Price Rules API (no webhook available) |
| `revenue` | Derived | Daily totals recalculated from orders on each order webhook |
| `suppliers` | Ours | Supplier CRUD — not in Shopify, we own this entirely |
| `returns` | Ours | Return request workflow — calls Shopify Refunds API on approval |
| `settings` | Ours | Store config (name, email, currency, timezone, country) |

### Commands

```bash
docker compose up -d       # start MySQL
docker compose down        # stop (data persists in volume)
docker compose down -v     # stop + wipe all data

npm run db:seed            # seed all tables with dev data (idempotent)
npm run db:sync            # bulk sync from Shopify Admin API (run before go-live)
npm run db:sync -- orders  # sync only one table (orders | customers | inventory | discounts)
```

### Sync architecture

```
Shopify (source of truth)
    ↕  webhooks + Admin API
MySQL (cache + extensions)
    ↕
Next.js API routes
  reads  → always hit DB (fast, no rate limits)
  writes → Shopify first, then update DB
```

Webhook handler: `POST /api/webhooks/shopify` — verifies HMAC, routes by topic, upserts DB.

See [`docs/db-cache-plan.md`](docs/db-cache-plan.md) for the full sync architecture.

---

## Project Structure

```
app/
  (storefront)/         # Customer-facing pages (/, /collections, /products, /cart)
  admin/                # Admin panel pages
  api/
    auth/               # Login / logout
    admin/[...path]/    # Admin API — JWT-protected, reads from DB
    webhooks/shopify/   # Shopify webhook receiver (HMAC verified)

components/             # Shared UI (Navbar, Footer, Hero, etc.)
storefront/             # Storefront components (ProductCard, CartDrawer, etc.)
admin/components/       # Admin components (DataTable, StatsCard, AdminSidebar, etc.)
lib/
  db.js                 # mysql2 connection pool ($N→? placeholder shim)
  sync.js               # Upsert helpers called by webhook handler + bulk sync
  shopify.js            # Storefront API client (reads from DB, swaps to GraphQL later)
  auth.js               # JWT sign/verify + bcrypt credential check
  cart.js               # Cart stubs (swaps to Shopify Cart API later)
context/                # CartContext (cart state + localStorage)
hooks/                  # useCart, useFadeIn
db/
  schema.sql            # Full DB schema (auto-runs on first docker compose up)
  seed.js               # Dev data seed script
  sync.js               # Bulk sync CLI from Shopify Admin API
tests/                  # Vitest test suite (36 tests)
docs/                   # Architecture plans and notes
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
# Database
DATABASE_URL=mysql://northern_blue:northern_blue@localhost:3306/northern_blue

# Admin auth
ADMIN_JWT_SECRET=a-long-random-secret-at-least-32-chars
ADMIN_USERNAME=admin
# Generate with: node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
ADMIN_PASSWORD_HASH=$2b$10$replacethiswithyourrealhash

# Shopify (add when wiring up)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
SHOPIFY_ADMIN_API_TOKEN=shpat_your-admin-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-signing-secret
```

---

## What's Built

**Storefront**
- Home page — hero, about, collections, contact
- `/collections` — all collections
- `/collections/[handle]` — products in a collection (SSR)
- `/products/[handle]` — product detail with size selector and add to cart
- `/cart` — full cart page
- `/size-guide` — size chart
- Cart drawer with quantity controls, subtotal, checkout button

**Admin Panel** (`/admin`)
- Login with JWT auth + bcrypt + route protection via middleware
- Dashboard — revenue chart (30 days), stats cards, low stock alerts
- Products — list, create, edit
- Orders — list with status filters, order detail, fulfill action
- Inventory — stock levels with low-stock highlighting
- Customers — list, customer detail with order history
- Returns — request workflow (requested → approved/declined → refunded)
- Discounts — list, create, active toggle
- Suppliers — CRUD, integration type, contact info
- Settings — store info, password change

---

## Wiring Up Shopify

When Shopify tokens are ready, three files need updating:

| File | What to change |
|---|---|
| `lib/shopify.js` | Uncomment GraphQL client, replace DB queries with Storefront API calls |
| `lib/cart.js` | Replace localStorage stubs with Shopify Cart API mutations |
| `lib/sync.js` + `db/sync.js` | Already wired — just add `SHOPIFY_ADMIN_API_TOKEN` and run `npm run db:sync` |

Then register webhooks in Shopify admin → Settings → Notifications:
- `orders/create`, `orders/updated` → `https://yourdomain.com/api/webhooks/shopify`
- `customers/create`, `customers/update` → same URL
- `inventory_levels/update` → same URL

See [`docs/ecommerce-integration-plan.md`](docs/ecommerce-integration-plan.md) and [`docs/db-cache-plan.md`](docs/db-cache-plan.md).

---

## Commands

```bash
npm run dev          # Dev server with Turbopack (http://localhost:3000)
npm run build        # Production build (Turbopack)
npm run start        # Start production server
npm test             # Run tests (watch mode)
npm run test:run     # Run tests once
npm run db:seed      # Seed database with dev data
npm run db:sync      # Bulk sync from Shopify Admin API
```

---

## Roadmap

- [ ] Wire up Shopify (tokens + 3 file swaps + register webhooks)
- [ ] Phase 4: next/image, loading/error states, sitemap, SEO
- [ ] Supplier order forwarding (email → webhook → API)
- [ ] Phase C: write-through on discount create/toggle and return refunds (Shopify API calls)
