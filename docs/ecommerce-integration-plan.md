# Northern Blue E-Commerce Integration Plan

## Context

Northern Blue is a plus-size women's clothing brand with an existing React 19 + Vite 7 + Tailwind CSS 3 single-page landing site. The goal is to:
1. **Migrate from Vite SPA to Next.js** for SSR/SSG (product page SEO, fast mobile performance, built-in API routes)
2. **Add a Shopify-powered storefront** (product browsing, cart, Shopify-hosted checkout)
3. **Build a custom React admin panel** (product CRUD, orders, inventory, customers, discounts, returns)
4. **Prepare for future dropshipping** (supplier placeholder, flexible order fulfillment architecture)

Market: Canada only. Priority: launch fast with MVP basics.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Next.js App (single deployment)        │
│                                         │
│  (storefront)/    → SSR customer pages  │
│  admin/           → Custom admin panel  │
│  api/auth/        → Admin JWT login     │
│  api/admin/[...]  → Shopify Admin proxy │
└──────┬──────────────────────┬───────────┘
       │                      │
       │ Storefront API       │ Admin API
       │ (public token,       │ (private token,
       │  client+server)      │  server-only)
       │                      │
┌──────▼──────────────────────▼───────────┐
│           Shopify Backend               │
│  Products, Inventory, Orders, Tax,      │
│  Payments, Shipping, Customers          │
└─────────────────────────────────────────┘
```

**No separate Express server needed** — Next.js API routes handle everything.

---

## Folder Structure (Final State)

```
northern_blue/
  next.config.js                    # NEW (replaces vite.config.js)
  vitest.config.js                  # NEW (Vitest needs own config without Vite)
  tailwind.config.js                # MODIFY (update content paths + font vars)
  postcss.config.js                 # KEEP as-is
  .env.local                        # NEW (Shopify tokens, admin creds)
  .env.example                      # NEW (template)
  jsconfig.json                     # NEW (@ path alias)

  app/
    layout.jsx                      # Root layout (html, body, next/font, CartProvider)
    globals.css                     # From src/index.css
    (storefront)/
      layout.jsx                   # StorefrontLayout (Navbar + Footer + CartDrawer)
      page.jsx                     # Home page (Hero + About + Collections + Contact)
      collections/
        page.jsx                   # All collections listing
        [handle]/page.jsx          # Products in a collection (SSR)
      products/
        [handle]/page.jsx          # Product detail (SSR)
      cart/page.jsx                # Full cart page
      size-guide/page.jsx          # Size guide
    admin/
      layout.jsx                   # Admin layout (sidebar + header, auth check)
      page.jsx                     # Dashboard
      login/page.jsx               # Admin login
      products/page.jsx            # Product list
      products/new/page.jsx        # Create product
      products/[id]/edit/page.jsx  # Edit product
      orders/page.jsx
      orders/[id]/page.jsx
      customers/page.jsx
      customers/[id]/page.jsx
      inventory/page.jsx
      discounts/page.jsx
      returns/page.jsx
      suppliers/page.jsx           # Placeholder for future dropshipping
      settings/page.jsx
    api/
      auth/login/route.js          # POST: admin login → JWT cookie
      auth/me/route.js             # GET: validate token
      admin/[...path]/route.js     # Catch-all proxy to Shopify Admin API

  components/                       # MOVED from src/components/
    AnnouncementBar.jsx            # Add 'use client', "Shop now" → next/link
    Navbar.jsx                     # Add 'use client', add Shop + Cart links, use next/link
    Hero.jsx                       # Add 'use client'
    About.jsx                      # Add 'use client'
    Collections.jsx                # Add 'use client', "Explore" → next/link
    ContactForm.jsx                # Add 'use client'
    Footer.jsx                     # Add 'use client', add shop/policy links
    ButterflyLogo.jsx              # Add 'use client'

  storefront/                       # NEW: e-commerce components
    ProductCard.jsx, PriceDisplay.jsx, CollectionHeader.jsx,
    ProductGallery.jsx, ProductVariantSelector.jsx, AddToCartButton.jsx,
    CartDrawer.jsx, CartLineItem.jsx, CartSummary.jsx, SizeGuideTable.jsx

  admin/components/                 # NEW: admin components
    AdminSidebar.jsx, AdminHeader.jsx, DataTable.jsx, StatsCard.jsx,
    StatusBadge.jsx, ImageUploader.jsx, VariantEditor.jsx,
    LowStockAlert.jsx, OrderTimeline.jsx, RevenueChart.jsx

  lib/
    shopify.js                     # Storefront API client + GraphQL queries
    shopify-admin.js               # Admin API client (for API routes)
    cart.js                        # Shopify Cart API mutations
    formatCurrency.js              # CAD formatting
    auth.js                        # JWT sign/verify + bcrypt

  context/
    CartContext.jsx                 # Cart state provider ('use client')

  hooks/
    useFadeIn.js                   # MOVED from src/hooks/
    useCart.js                     # NEW: convenience hook for CartContext

  tests/                            # MOVED from src/test/
    setup.js
    *.test.jsx

  DELETE: src/, index.html, vite.config.js
```

---

## Environment Variables (`.env.local`)

```env
# Client-side (NEXT_PUBLIC_ prefix = bundled into browser JS)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=northern-blue.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxxxxx

# Server-side only (NO NEXT_PUBLIC_ prefix — never reaches browser)
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxx
ADMIN_JWT_SECRET=random-string-at-least-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
```

---

## Component 'use client' Audit

All existing components use browser APIs (useState, useEffect, useRef, useId, IntersectionObserver) and need `'use client'`:

| Component | Reason |
|-----------|--------|
| AnnouncementBar | useState (dismiss) |
| Navbar | useState (mobile menu) |
| Hero | ButterflyLogo (useId) |
| About | useRef + useFadeIn (IntersectionObserver) |
| Collections | useRef + useFadeIn + ButterflyLogo |
| ContactForm | useState + useRef + useFadeIn |
| Footer | ButterflyLogo (useId) |
| ButterflyLogo | useId |
| useFadeIn | useEffect + IntersectionObserver |

New server components (no 'use client'): product listing pages, product detail pages, collection pages — these fetch data server-side and pass to client components.

---

## Dependencies

**Remove:** `vite`, `@vitejs/plugin-react` (keep for Vitest only as devDep), `eslint-plugin-react-refresh`

**Add:**
| Package | Purpose | Phase |
|---------|---------|-------|
| `next` | Framework | 0 |
| `graphql-request` + `graphql` | Storefront API client | 1 |
| `jsonwebtoken` + `bcryptjs` | Admin auth | 2 |
| `react-hot-toast` | Toast notifications | 1 |
| `@tanstack/react-query` | Admin data fetching + caching | 2 |
| `recharts` | Admin dashboard charts | 2 |

**Keep:** `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/*`, `jsdom`

---

## Phased Implementation

### Phase 0: Migrate Vite → Next.js (FIRST PRIORITY)

This is a framework swap only — no new features. The site must look and work identically after.

**0.1 — Dependency swap**
- [ ] Remove `vite`, `eslint-plugin-react-refresh` from dependencies
- [ ] Add `next` to dependencies
- [ ] Update `package.json` scripts: `dev` → `next dev`, `build` → `next build`, `start` → `next start`
- **Files:** `package.json`

**0.2 — Config files**
- [ ] Create `next.config.js` (reactStrictMode, images.remotePatterns for cdn.shopify.com)
- [ ] Create `jsconfig.json` with `@` path alias to project root
- [ ] Create `vitest.config.js` (standalone config since vite.config.js is removed)
- [ ] Update `tailwind.config.js`: content paths → `./app/**/*`, `./components/**/*`, `./storefront/**/*`, `./admin/**/*`; font families → CSS variables `var(--font-inter)`, `var(--font-playfair)`
- [ ] Add `.next` to `.gitignore`
- **Files:** `next.config.js`, `jsconfig.json`, `vitest.config.js`, `tailwind.config.js`, `.gitignore`

**0.3 — Move files out of src/**
- [ ] Move `src/components/*` → `components/`
- [ ] Move `src/hooks/*` → `hooks/`
- [ ] Move `src/test/*` → `tests/`
- [ ] Copy `src/index.css` → `app/globals.css`

**0.4 — Create Next.js app structure**
- [ ] Create `app/layout.jsx` — root layout with `next/font/google` (Playfair Display + Inter), import globals.css, html/body tags, metadata
- [ ] Create `app/page.jsx` — home page rendering AnnouncementBar + Navbar + Hero + About + Collections + ContactForm + Footer (same as current App.jsx)
- **Files:** `app/layout.jsx`, `app/page.jsx`

**0.5 — Add 'use client' to all migrated components**
- [ ] Add `'use client'` as first line to every file in `components/` and `hooks/`
- [ ] Update import paths: `'../hooks/useFadeIn'` → `'@/hooks/useFadeIn'`
- **Files:** all files in `components/`, `hooks/`

**0.6 — Update tests**
- [ ] Update test imports to new paths (`@/components/...`)
- [ ] Update `vitest.config.js` setup file path
- **Files:** all files in `tests/`

**0.7 — Delete old files**
- [ ] Delete `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`
- [ ] Delete `src/` directory entirely

**0.8 — Verify**
- [ ] `npm run dev` → landing page renders identically
- [ ] `npm test` → all existing tests pass
- [ ] Visual check: fonts, colors, animations, scroll behavior all working

---

### Phase 1: MVP Storefront

**1.1 — Shopify Storefront API client**
- [ ] Create `lib/shopify.js` — graphql-request client with Storefront API queries (getCollections, getCollectionByHandle, getProductByHandle)
- [ ] Create `lib/cart.js` — Cart API mutations (createCart, addLines, updateLines, removeLines, getCart)
- [ ] Create `lib/formatCurrency.js` — CAD Intl.NumberFormat helper
- [ ] Create `.env.local` / `.env.example` with Shopify token placeholders

**1.2 — Cart context**
- [ ] Create `context/CartContext.jsx` ('use client') — cart state, localStorage persistence, cart operations
- [ ] Create `hooks/useCart.js` — convenience hook wrapping useContext
- [ ] Wrap app with CartProvider in `app/layout.jsx`

**1.3 — Storefront layout + navigation**
- [ ] Create `app/(storefront)/layout.jsx` — StorefrontLayout with AnnouncementBar, Navbar, Footer, CartDrawer
- [ ] Move `app/page.jsx` → `app/(storefront)/page.jsx`
- [ ] Update `components/Navbar.jsx` — add Shop link (`/collections`), cart icon with badge, use `next/link`, use `/#about` pattern for cross-page anchor links
- [ ] Update `components/AnnouncementBar.jsx` — "Shop now" → `next/link` to `/collections`
- [ ] Update `components/Footer.jsx` — add shop/policy links with `next/link`
- [ ] Update `components/Collections.jsx` — "Explore" buttons → `next/link` to `/collections/[handle]`

**1.4 — Product pages**
- [ ] Create `storefront/ProductCard.jsx` — thumbnail, title, price, link to product
- [ ] Create `storefront/PriceDisplay.jsx` — formatted price display
- [ ] Create `storefront/CollectionHeader.jsx` — collection title + description
- [ ] Create `app/(storefront)/collections/page.jsx` — all collections listing (SSR)
- [ ] Create `app/(storefront)/collections/[handle]/page.jsx` — products in collection (SSR with generateMetadata)
- [ ] Create `storefront/ProductGallery.jsx` ('use client') — image gallery with thumbnail selection
- [ ] Create `storefront/ProductVariantSelector.jsx` ('use client') — size/color picker
- [ ] Create `storefront/AddToCartButton.jsx` ('use client') — add to cart with toast
- [ ] Create `app/(storefront)/products/[handle]/page.jsx` — product detail (SSR with generateMetadata + OG tags)

**1.5 — Cart**
- [ ] Create `storefront/CartDrawer.jsx` ('use client') — slide-out cart sidebar
- [ ] Create `storefront/CartLineItem.jsx` ('use client') — line item with quantity controls
- [ ] Create `storefront/CartSummary.jsx` — subtotal + checkout button (→ Shopify hosted checkout)
- [ ] Create `app/(storefront)/cart/page.jsx` — full-page cart view

**1.6 — Size guide**
- [ ] Create `storefront/SizeGuideTable.jsx` — responsive size chart
- [ ] Create `app/(storefront)/size-guide/page.jsx`

---

### Phase 2: Custom Admin Panel

**2.1 — Auth backend**
- [ ] Create `lib/auth.js` — JWT sign/verify, bcrypt password check
- [ ] Create `app/api/auth/login/route.js` — POST login → httpOnly JWT cookie
- [ ] Create `app/api/auth/me/route.js` — GET validate token

**2.2 — Admin API proxy**
- [ ] Create `app/api/admin/[...path]/route.js` — catch-all proxy to Shopify Admin API (validates JWT, forwards with private token)
- [ ] Create `lib/shopify-admin.js` — helper functions for Admin API calls

**2.3 — Admin shell**
- [ ] Create `app/admin/layout.jsx` — sidebar + header layout, auth redirect
- [ ] Create `app/admin/login/page.jsx` — login form
- [ ] Create `admin/components/AdminSidebar.jsx` — nav links with active state
- [ ] Create `admin/components/AdminHeader.jsx` — title + logout
- [ ] Create `admin/components/DataTable.jsx` — reusable sortable/paginated table
- [ ] Create `admin/components/StatsCard.jsx` — metric card
- [ ] Create `admin/components/StatusBadge.jsx` — color-coded status pill

**2.4 — Core admin pages**
- [ ] `app/admin/page.jsx` — Dashboard (stats cards, recent orders, low stock alerts)
- [ ] `app/admin/products/page.jsx` — Product list with search
- [ ] `app/admin/products/new/page.jsx` — Create product form
- [ ] `app/admin/products/[id]/edit/page.jsx` — Edit product form
- [ ] `admin/components/VariantEditor.jsx` — size/color variant form
- [ ] `admin/components/ImageUploader.jsx` — drag-and-drop image upload
- [ ] `app/admin/orders/page.jsx` — Order list with status filters
- [ ] `app/admin/orders/[id]/page.jsx` — Order detail + fulfillment actions
- [ ] `admin/components/OrderTimeline.jsx` — order event history
- [ ] `app/admin/inventory/page.jsx` — Stock levels with low-stock highlighting
- [ ] `admin/components/LowStockAlert.jsx`
- [ ] `app/admin/customers/page.jsx` — Customer list
- [ ] `app/admin/customers/[id]/page.jsx` — Customer detail + order history

---

### Phase 3: Extended Features

- [ ] `app/admin/discounts/page.jsx` — Coupon management via Shopify Price Rules API
- [ ] `app/admin/returns/page.jsx` — Returns/exchanges workflow
- [ ] `app/admin/suppliers/page.jsx` — Placeholder with "Coming Soon" + skeleton UI
- [ ] `admin/components/RevenueChart.jsx` — recharts revenue chart
- [ ] Enhanced dashboard with charts + time-range filters
- [ ] `app/admin/settings/page.jsx` — Store settings display + admin password change

---

### Phase 4: Polish & Production

- [ ] SEO: `app/sitemap.js` (dynamic), `app/robots.js` (disallow /admin), JSON-LD product schema
- [ ] Performance: `next/image` for all product images, React.lazy for admin pages
- [ ] Loading states: `loading.jsx` files for each route segment
- [ ] Error boundaries: `error.jsx` files
- [ ] `not-found.jsx` for 404 pages
- [ ] Accessibility audit
- [ ] Production deployment config (Vercel or self-hosted)
- [ ] Canadian tax verification in Shopify settings (GST/HST/PST by province)

---

## Key Data Flows

**Customer browses products (SSR):**
```
Browser → GET /collections/dresses
  → app/(storefront)/collections/[handle]/page.jsx (server component)
    → lib/shopify.js → getCollectionByHandle('dresses')
      → GraphQL → Shopify Storefront API
    → Returns HTML with products pre-rendered (fast, SEO-friendly)
```

**Customer adds to cart (client-side):**
```
AddToCartButton click
  → useCart().addItem(variantId, 1)
    → CartContext → lib/cart.js → cartLinesAdd mutation
      → Shopify Storefront API
    → Update context state → show toast → open CartDrawer
```

**Customer checks out:**
```
CartSummary "Checkout" button
  → window.location.href = cart.checkoutUrl
  → Shopify-hosted checkout (handles payment, Canadian tax, shipping)
```

**Admin edits product:**
```
Admin ProductFormPage submit
  → fetch('/api/admin/products/123.json', { method: 'PUT', body })
    → app/api/admin/[...path]/route.js
      → Verify JWT cookie ✓
      → Forward to Shopify Admin API with private token
    → Return updated product
```

---

## Verification

1. **Phase 0**: `npm run dev` renders identical landing page; `npm test` passes all tests
2. **Phase 1**: Browse collections → view product → add to cart → checkout redirects to Shopify
3. **Phase 2**: `/admin` → login → dashboard shows stats → CRUD products → view/fulfill orders
4. **Phase 4**: Lighthouse score >90 on mobile, all product pages indexed by Google
