# Northern Blue

Plus-size women's clothing brand. Built with Next.js 15, Tailwind CSS, and Shopify (storefront + admin).

## Stack

- **Framework:** Next.js 15 (App Router, SSR)
- **Styling:** Tailwind CSS 3
- **E-commerce:** Shopify Storefront API (cart, checkout) + Shopify Admin API (orders, products, customers)
- **Auth:** JWT via httpOnly cookie (admin panel)
- **Testing:** Vitest + Testing Library (36 tests)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Username: `admin` / Password: `admin123` *(test credentials — change before production)*

## Project Structure

```
app/
  (storefront)/       # Customer-facing pages (/, /collections, /products, /cart)
  admin/              # Admin panel (dashboard, products, orders, inventory, customers)
  api/
    auth/             # Login, logout, token validation
    admin/[...path]/  # Shopify Admin API proxy (JWT-protected)

components/           # Shared UI components (Navbar, Footer, Hero, etc.)
storefront/           # Storefront-specific components (ProductCard, CartDrawer, etc.)
admin/components/     # Admin-specific components (DataTable, StatsCard, etc.)
lib/                  # API clients, auth helpers, mock data, formatters
context/              # CartContext (cart state + localStorage persistence)
hooks/                # useCart, useFadeIn
tests/                # Vitest test suite
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Shopify tokens:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-token

SHOPIFY_ADMIN_API_TOKEN=shpat_your-admin-token
ADMIN_JWT_SECRET=a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your-bcrypt-hash
```

## Current State

The storefront and admin panel are fully built with **mock data**. Three files swap them to real Shopify:

| File | What to change |
|------|---------------|
| `lib/shopify.js` | Uncomment GraphQL client, replace stub functions |
| `lib/cart.js` | Replace localStorage stubs with Shopify Cart API mutations |
| `app/api/admin/[...path]/route.js` | Forward requests to Shopify Admin API instead of returning mock data |

Install `graphql-request` when ready: `npm install graphql-request graphql`

See [`docs/ecommerce-integration-plan.md`](docs/ecommerce-integration-plan.md) for the full plan and wiring instructions.

## What's Built

**Storefront**
- Home page (hero, about, collections, contact)
- `/collections` — all collections
- `/collections/[handle]` — products in a collection (SSR)
- `/products/[handle]` — product detail with size selector + add to cart
- `/cart` — full cart page
- `/size-guide` — size chart
- Cart drawer with quantity controls, subtotal, checkout button

**Admin Panel** (`/admin`)
- Login with JWT auth + route protection via middleware
- Dashboard — revenue stats, recent orders, low stock alerts
- Products — list, create, edit
- Orders — list with status filters, order detail, fulfill action
- Inventory — stock levels with low-stock highlighting
- Customers — list, customer detail with order history

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
```

## Roadmap

- [ ] Wire up Shopify (tokens + 3 file swaps)
- [ ] Phase 3: Discounts, returns, revenue chart, settings
- [ ] Phase 4: next/image, loading/error states, sitemap, SEO, Vercel deploy
