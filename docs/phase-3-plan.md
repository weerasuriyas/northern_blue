# Phase 3 Plan — Extended Admin Features

## Status Legend
- ⬜ Not started
- 🔄 In progress
- ✅ Complete

---

## Overview

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Revenue chart (dashboard) | ⬜ | Needs recharts installed |
| 3.2 | Discounts page | ⬜ | |
| 3.3 | Returns page | ⬜ | Most complex |
| 3.4 | Suppliers page | ⬜ | CRUD only, no forwarding logic yet |
| 3.5 | Settings + credential upgrade | ⬜ | Removes hardcoded admin123 |

---

## Open Questions (answer before building)

- **Revenue chart** — bar or line/area? Fixed 30 days or time range selector (7d / 30d / 90d)?
- **Returns** — refunds only, or exchanges too (return item A, send item B)?
- **Discounts** — types needed: % off, $ off, free shipping, BOGO, or just the basics?
- **Suppliers** — any specific supplier in mind? Shapes the form fields.
- **Credentials** — ready to move admin123 out of code into .env.local?

---

## 3.1 — Revenue Chart ⬜

**Location:** `/admin` dashboard, below stats cards

**What it shows:** Daily revenue over the last 30 days as a bar or area chart.

**Dependencies:** `recharts` (install when starting)

### Files to create/modify
- [ ] Install `recharts`
- [ ] `admin/components/RevenueChart.jsx` — chart component
- [ ] `lib/mock-admin-data.js` — add 30 days of mock revenue data
- [ ] `app/api/admin/[...path]/route.js` — add `revenue.json` endpoint
- [ ] `app/admin/page.jsx` — add chart below stats cards

### Data shape
```js
// GET /api/admin/revenue.json
{
  revenue: [
    { date: '2026-03-09', amount: 0 },
    { date: '2026-03-10', amount: 139.98 },
    // ... 30 days
  ]
}
```

---

## 3.2 — Discounts Page ⬜

**Location:** `/admin/discounts`

**What it does:** List, create, and toggle promo codes. Maps to Shopify Price Rules + Discount Codes API when wired up.

### Discount data shape
```js
{
  id: 'disc-1',
  code: 'SUMMER20',
  type: 'percentage',        // 'percentage' | 'fixed_amount' | 'free_shipping'
  value: 20,                 // 20% off
  minOrderAmount: 50,        // minimum $50 order
  usageLimit: 100,           // max redemptions (null = unlimited)
  usageCount: 14,            // times used so far
  expiresAt: '2026-08-31',   // null = no expiry
  active: true,
}
```

### Files to create/modify
- [ ] `lib/mock-admin-data.js` — add mock discount codes
- [ ] `app/api/admin/[...path]/route.js` — add `discounts.json` endpoint
- [ ] `app/admin/discounts/page.jsx` — list with active toggle + create button
- [ ] `app/admin/discounts/new/page.jsx` — create discount form
- [ ] Add discounts link to `admin/components/AdminSidebar.jsx`

---

## 3.3 — Returns Page ⬜

**Location:** `/admin/returns`

**What it does:** Manage return requests through a state workflow.

### Return states
```
requested → approved / declined → refunded
```

### Return data shape
```js
{
  id: 'return-1',
  orderId: 'order-1002',
  orderName: '#1002',
  customerName: 'Priya Sharma',
  customerEmail: 'priya.sharma@email.com',
  requestedAt: '2026-04-07T10:00:00Z',
  reason: 'Wrong size',
  items: [
    { title: 'Classic Jersey Tee', variantTitle: '3X', quantity: 1, price: '34.99' }
  ],
  refundAmount: '34.99',
  currencyCode: 'CAD',
  status: 'requested',       // 'requested' | 'approved' | 'declined' | 'refunded'
  timeline: [
    { at: '2026-04-07T10:00:00Z', message: 'Return requested by customer' }
  ],
  notes: '',
}
```

### Files to create/modify
- [ ] `lib/mock-admin-data.js` — add mock return requests
- [ ] `app/api/admin/[...path]/route.js` — add `returns.json` + `returns/[id].json` endpoints
- [ ] `app/admin/returns/page.jsx` — list with status filter tabs
- [ ] `app/admin/returns/[id]/page.jsx` — detail with approve/decline/refund actions + timeline
- [ ] Add returns link to `admin/components/AdminSidebar.jsx`

---

## 3.4 — Suppliers Page ⬜

**Location:** `/admin/suppliers`

**What it does:** CRUD for supplier records. No order forwarding logic yet — that comes when a real supplier is confirmed. See `docs/supplier-integration-plan.md` for the full forwarding architecture.

### Supplier data shape
```js
{
  id: 'sup-1',
  name: 'Maple Textiles Co.',
  contactName: 'Jane Doe',
  contactEmail: 'orders@mapletextiles.ca',
  phone: '+1-416-555-0100',
  country: 'Canada',
  leadTimeDays: 5,
  integrationType: 'email',  // 'manual' | 'email' | 'api' | 'shopify_collective'
  apiEndpoint: null,
  apiKey: null,
  active: true,
  notes: 'Minimum order 3 units per SKU',
  productCount: 4,           // how many products assigned to this supplier
}
```

### Files to create/modify
- [ ] `lib/mock-admin-data.js` — add mock suppliers
- [ ] `app/api/admin/[...path]/route.js` — add `suppliers.json` + `suppliers/[id].json` endpoints
- [ ] `app/admin/suppliers/page.jsx` — list (replaces current "Coming Soon" placeholder)
- [ ] `app/admin/suppliers/new/page.jsx` — add supplier form
- [ ] `app/admin/suppliers/[id]/page.jsx` — supplier detail + assigned products

---

## 3.5 — Settings + Credential Upgrade ⬜

**Location:** `/admin/settings`

**What it does:** Two sections — store info display and admin security (password change). Also removes hardcoded `admin123` from code.

### Credential upgrade plan
1. Install `bcryptjs`
2. Update `lib/auth.js` — replace hardcoded string compare with `bcrypt.compare()`
3. Read username + hashed password from `process.env.ADMIN_USERNAME` and `process.env.ADMIN_PASSWORD_HASH`
4. Add a one-time script or instructions for generating the bcrypt hash
5. Update `.env.example` with `ADMIN_PASSWORD_HASH` instructions

### Files to create/modify
- [ ] Install `bcryptjs`
- [ ] `lib/auth.js` — swap hardcoded credentials for env vars + bcrypt
- [ ] `.env.example` — update with bcrypt hash instructions
- [ ] `app/api/admin/[...path]/route.js` — add `settings.json` endpoint
- [ ] `app/admin/settings/page.jsx` — store info + password change form

### Store info shape (stub, will come from Shopify later)
```js
{
  storeName: 'Northern Blue',
  email: 'admin@northernblue.ca',
  currency: 'CAD',
  timezone: 'America/Toronto',
  country: 'Canada',
}
```

---

## Build Order

1. **3.1 Revenue chart** — quick win, no new routes or sidebar changes
2. **3.5 Settings + credentials** — security, get hardcoded password out of code
3. **3.4 Suppliers** — already planned, straightforward CRUD
4. **3.2 Discounts** — useful for launch promotions
5. **3.3 Returns** — most complex, build last
