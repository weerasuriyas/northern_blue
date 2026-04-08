# Northern Blue E-Commerce Integration Plan

## Context

Northern Blue is a plus-size women's clothing brand. The site has been migrated from a React 19 + Vite 7 SPA to a **Next.js 15 + Tailwind CSS 3** app. The goal is:
1. ✅ **Migrate from Vite SPA to Next.js** — complete
2. ✅ **Add a Shopify-powered storefront** — UI built with mock data, ready to wire up
3. ✅ **Build a custom React admin panel** — built with mock data, ready to wire up
4. **Prepare for future dropshipping** — suppliers page placeholder (Phase 3)

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

## Current Folder Structure

```
northern_blue/
  next.config.js                    ✅ created
  vitest.config.js                  ✅ created (standalone, @ alias)
  tailwind.config.js                ✅ updated (new content paths + font CSS vars)
  postcss.config.js                 unchanged
  jsconfig.json                     ✅ created (@ alias to project root)
  middleware.js                     ✅ created (protects /admin/* routes)
  .env.local                        create when Shopify tokens are ready
  .env.example                      ✅ created

  app/
    layout.jsx                      ✅ root layout (fonts, CartProvider, Toaster)
    globals.css                     ✅ moved from src/index.css
    (storefront)/
      layout.jsx                   ✅ StorefrontLayout (AnnouncementBar + Navbar + Footer + CartDrawer)
      page.jsx                     ✅ Home page (Hero + About + Collections + ContactForm)
      collections/
        page.jsx                   ✅ All collections listing (SSR)
        [handle]/page.jsx          ✅ Products in a collection (SSR + generateMetadata)
      products/
        [handle]/page.jsx          ✅ Product detail (variant selector + add to cart)
      cart/page.jsx                ✅ Full cart page
      size-guide/page.jsx          ✅ Size guide
    admin/
      layout.jsx                   ✅ Admin shell (sidebar)
      page.jsx                     ✅ Dashboard (stats + recent orders + low stock)
      login/page.jsx               ✅ Login form (hardcoded admin/admin123)
      products/page.jsx            ✅ Product list + search
      products/new/page.jsx        ✅ Create product form
      products/[id]/edit/page.jsx  ✅ Edit product form
      orders/page.jsx              ✅ Order list + status filters
      orders/[id]/page.jsx         ✅ Order detail + fulfill action + timeline
      customers/page.jsx           ✅ Customer list + search
      customers/[id]/page.jsx      ✅ Customer detail + order history
      inventory/page.jsx           ✅ Stock levels with low-stock highlighting
      discounts/page.jsx           Phase 3
      returns/page.jsx             Phase 3
      suppliers/page.jsx           Phase 3
      settings/page.jsx            Phase 3
    api/
      auth/login/route.js          ✅ POST login → JWT cookie
      auth/me/route.js             ✅ GET validate token
      auth/logout/route.js         ✅ POST clear cookie
      admin/[...path]/route.js     ✅ Catch-all proxy (stub, ready for Shopify)

  components/                      ✅ moved from src/components/, all have 'use client'
    AnnouncementBar.jsx            ✅ "Shop now" → next/link to /collections
    Navbar.jsx                     ✅ Shop link + cart icon with badge
    Hero.jsx                       ✅
    About.jsx                      ✅
    Collections.jsx                ✅ "Explore" → next/link to /collections/[handle]
    ContactForm.jsx                ✅
    Footer.jsx                     ✅ shop/policy links
    ButterflyLogo.jsx              ✅

  storefront/                      ✅ all components built
    ProductCard.jsx                ✅
    PriceDisplay.jsx               ✅
    CollectionHeader.jsx           ✅
    ProductGallery.jsx             ✅ (use client)
    ProductVariantSelector.jsx     ✅ (use client)
    AddToCartButton.jsx            ✅ (use client, react-hot-toast)
    CartDrawer.jsx                 ✅ (use client)
    CartLineItem.jsx               ✅ (use client)
    CartSummary.jsx                ✅
    SizeGuideTable.jsx             ✅

  admin/components/                ✅ all components built
    AdminSidebar.jsx               ✅ (use client, active state)
    AdminHeader.jsx                ✅ (use client, logout)
    DataTable.jsx                  ✅
    StatsCard.jsx                  ✅
    StatusBadge.jsx                ✅
    LowStockAlert.jsx              ✅
    OrderTimeline.jsx              ✅

  lib/
    shopify.js                     ✅ stub (swap to GraphQL when tokens ready)
    shopify-admin.js               ✅ stub (swap to real proxy when tokens ready)
    cart.js                        ✅ stub (swap to Shopify Cart API when ready)
    formatCurrency.js              ✅ CAD Intl.NumberFormat
    auth.js                        ✅ JWT sign/verify, hardcoded test credentials
    mock-data.js                   ✅ 12 products, 4 collections (Shopify shape)
    mock-admin-data.js             ✅ 10 orders, 10 customers, 24 inventory rows

  context/
    CartContext.jsx                ✅ (use client, localStorage persistence)

  hooks/
    useFadeIn.js                   ✅ moved from src/hooks/
    useCart.js                     ✅

  tests/                           ✅ moved from src/test/, all imports updated to @/
    setup.js
    *.test.jsx                     36 tests passing

  DELETE (done): src/, index.html, vite.config.js
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

## Dependencies

**Removed:** `vite`, `eslint-plugin-react-refresh`
**Kept as devDep (for Vitest):** `@vitejs/plugin-react`, `vite`

| Package | Purpose | Status |
|---------|---------|--------|
| `next` ^15.3 | Framework | ✅ installed |
| `react-hot-toast` ^2.6 | Toast notifications | ✅ installed |
| `jsonwebtoken` | Admin auth JWT | ✅ installed |
| `graphql-request` + `graphql` | Storefront API client | install when wiring Shopify |
| `bcryptjs` | Admin password hashing | install when hardcode removed |
| `@tanstack/react-query` | Admin data fetching/caching | Phase 3 optional |
| `recharts` | Admin dashboard charts | Phase 3 |

---

## Phased Implementation

### Phase 0: Migrate Vite → Next.js ✅ COMPLETE (2026-04-07)

- [x] Dependency swap (next added, vite scripts replaced)
- [x] Config files (next.config.js, jsconfig.json, vitest.config.js)
- [x] Tailwind content paths + font CSS variables
- [x] .gitignore updated (.next added)
- [x] src/ files moved to components/, hooks/, tests/
- [x] app/layout.jsx + app/globals.css created
- [x] 'use client' added to all components and hooks
- [x] Import paths updated to @/ aliases
- [x] Tests updated and passing (35 → 36 tests)
- [x] src/, index.html, vite.config.js deleted

---

### Phase 1: MVP Storefront ✅ COMPLETE (2026-04-07)

**All built with mock data — swap lib/shopify.js + lib/cart.js for real Shopify.**

- [x] lib/shopify.js stub (getCollections, getCollectionByHandle, getProductByHandle)
- [x] lib/cart.js stub (add/update/remove lines, recalculates subtotal)
- [x] lib/formatCurrency.js (CAD)
- [x] lib/mock-data.js (12 products × 4 sizes across 4 collections)
- [x] .env.example created
- [x] CartContext + useCart hook + localStorage persistence
- [x] CartProvider + Toaster wired into app/layout.jsx
- [x] (storefront)/layout.jsx with AnnouncementBar, Navbar, Footer, CartDrawer
- [x] Home page moved to (storefront)/page.jsx
- [x] Navbar: Shop link + cart icon with item count badge
- [x] AnnouncementBar: "Shop now" links to /collections
- [x] Collections: "Explore" links to /collections/[handle]
- [x] Footer: shop + policy links
- [x] All storefront components built (ProductCard, Gallery, VariantSelector, AddToCartButton, CartDrawer, CartLineItem, CartSummary, SizeGuideTable)
- [x] /collections — all collections (SSR)
- [x] /collections/[handle] — products in collection (SSR + generateMetadata)
- [x] /products/[handle] — product detail with variant selector + add to cart
- [x] /cart — full cart page
- [x] /size-guide — size chart

---

### Phase 2: Custom Admin Panel ✅ COMPLETE (2026-04-08)

**All built with mock data — swap app/api/admin/[...path]/route.js for real Shopify proxy.**

- [x] lib/auth.js (JWT sign/verify, hardcoded test credentials: admin/admin123)
- [x] middleware.js (protects /admin/* routes, redirects to login if no cookie)
- [x] api/auth/login, me, logout routes
- [x] lib/mock-admin-data.js (10 orders, 10 customers, 24 inventory rows, dashboard stats)
- [x] lib/shopify-admin.js stub helpers
- [x] app/api/admin/[...path]/route.js catch-all (validates JWT, returns mock data)
- [x] AdminSidebar, AdminHeader, DataTable, StatsCard, StatusBadge, LowStockAlert, OrderTimeline
- [x] /admin/login — login form
- [x] /admin — dashboard (stats cards + recent orders + low stock alert)
- [x] /admin/products — list + search + new + edit
- [x] /admin/orders — list with status filters + order detail + fulfill action
- [x] /admin/inventory — stock levels, color-coded low stock
- [x] /admin/customers — list + search + customer detail + order history

---

### Phase 3: Extended Features

- [ ] `app/admin/discounts/page.jsx` — Coupon management
- [ ] `app/admin/returns/page.jsx` — Returns/exchanges workflow
- [ ] `app/admin/suppliers/page.jsx` — Placeholder (Coming Soon)
- [ ] `admin/components/RevenueChart.jsx` — recharts revenue chart on dashboard
- [ ] `app/admin/settings/page.jsx` — Store settings + password change
- [ ] Swap hardcoded admin credentials for bcrypt + env vars

> Note: discounts and returns are best implemented after Shopify is wired up — they depend on real order/price rule data.

---

### Phase 4: Polish & Production

- [ ] SEO: `app/sitemap.js` (dynamic), `app/robots.js` (disallow /admin), JSON-LD product schema
- [ ] Performance: `next/image` for all product images, React.lazy for admin pages
- [ ] Loading states: `loading.jsx` files per route segment
- [ ] Error boundaries: `error.jsx` files
- [ ] `not-found.jsx` for 404 pages
- [ ] Accessibility audit
- [ ] Canadian tax verification in Shopify settings (GST/HST/PST by province)
- [ ] Production deployment (Vercel recommended for Next.js)

---

## Wiring Up Shopify (When Ready)

### 1. Get tokens from Shopify
- Storefront API token (public, for browsing + cart)
- Admin API token (`shpat_...`, server-only, for admin panel)

### 2. Add to `.env.local`

### 3. Install `npm install graphql-request graphql`

### 4. Three files to update:
| File | Change |
|------|--------|
| `lib/shopify.js` | Uncomment GraphQL client, delete mock stubs |
| `lib/cart.js` | Replace localStorage stubs with Shopify Cart API mutations |
| `app/api/admin/[...path]/route.js` | Forward requests to Shopify Admin API instead of returning mock data |

No component changes needed — all components consume data in the same shape the real API returns.

---

## Key Data Flows

**Customer browses products (SSR):**
```
Browser → GET /collections/spring-collection
  → app/(storefront)/collections/[handle]/page.jsx (server component)
    → lib/shopify.js → getCollectionByHandle('spring-collection')
      → [stub] mock data  /  [real] GraphQL → Shopify Storefront API
    → Returns pre-rendered HTML (fast, SEO-friendly)
```

**Customer adds to cart (client-side):**
```
AddToCartButton click
  → useCart().addItem(variantId, 1, merchandise)
    → CartContext → lib/cart.js stub / Shopify Cart API
    → Update context state → localStorage → toast → open CartDrawer
```

**Customer checks out:**
```
CartSummary "Checkout" button
  → window.location.href = cart.checkoutUrl
  → Shopify-hosted checkout (payment, Canadian tax, shipping)
```

**Admin edits product:**
```
Admin ProductFormPage submit
  → fetch('/api/admin/products/123.json', { method: 'PUT', body })
    → app/api/admin/[...path]/route.js
      → Verify JWT cookie ✓
      → [stub] return ok  /  [real] Forward to Shopify Admin API
```

---

## Verification Checkpoints

1. ✅ **Phase 0**: `npm run dev` renders identical landing page; `npm test` passes all tests
2. ✅ **Phase 1**: Browse collections → view product → add to cart → cart drawer opens → checkout button present
3. ✅ **Phase 2**: `/admin/login` → dashboard shows stats → CRUD products → view/fulfill orders
4. **Phase 4**: Lighthouse score >90 on mobile, all product pages indexed by Google
