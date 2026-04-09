# Supplier Integration Plan

## Can We Forward Orders Through Shopify Directly?

**Short answer: Yes, but Shopify doesn't have a built-in "forward to supplier" button.**

There are three native Shopify mechanisms depending on your situation:

### Option 1: Shopify Collective (best if supplier is also on Shopify)
Shopify has a built-in dropshipping program called **Shopify Collective**. If your supplier uses Shopify:
- You connect your store to theirs inside Shopify admin
- Their products sync into your catalog automatically
- When a customer orders, Shopify forwards the order to the supplier's store automatically
- Supplier fulfills and ships directly, tracking syncs back to your store
- **Zero code required** — entirely handled inside Shopify

This is by far the easiest path if your supplier is on Shopify.

---

### Option 2: Shopify Fulfillment Service API (best for suppliers with their own API)
You register your backend as a **fulfillment service** inside Shopify. Shopify then owns the forwarding logic:

```
Customer orders
  → Shopify sees the order
  → Shopify checks: which fulfillment service handles these products?
  → Shopify POSTs to your /api/fulfillment/callback endpoint
  → Your endpoint calls the supplier's API
  → Supplier ships it
  → Supplier gives you a tracking number
  → You POST tracking back to Shopify
  → Shopify notifies the customer
```

Products are assigned to a fulfillment service in Shopify admin, so Shopify knows which orders to route where. This is the "proper" Shopify-native approach for custom suppliers.

---

### Option 3: Order Webhooks (simplest, works with anything)
Register a webhook in Shopify for `orders/create`. Every new order hits your endpoint:

```
Customer orders
  → Shopify fires webhook → POST /api/webhooks/orders
  → Your code checks which items need dropshipping
  → Forwards to supplier (API call, email, CSV — whatever they support)
  → Supplier ships
  → You manually or automatically update fulfillment in Shopify
```

Less integrated than Option 2, but simpler to build and works with any supplier regardless of their tech.

---

### Option 4: Manual (no API needed)
For suppliers without any API:
- Admin panel shows unfulfilled orders
- Click "Forward to Supplier" → generates a formatted order email or PDF
- You send it to the supplier yourself
- When they ship, you enter the tracking number in your admin panel
- Your admin panel updates Shopify via the Admin API

---

## Recommended Approach for Northern Blue

Start with **Option 4 (manual)** since you're likely working with small Canadian manufacturers who won't have APIs. Build toward **Option 3 (webhooks)** as volume grows. Migrate to **Option 1 (Shopify Collective)** if your supplier ever joins Shopify.

---

## Architecture

### Supplier Data Model

```js
{
  id: 'sup-1',
  name: 'Maple Textiles Co.',
  contactName: 'Jane Doe',
  contactEmail: 'orders@mapletextiles.ca',
  phone: '+1-416-555-0100',
  country: 'Canada',
  leadTimeDays: 5,           // how long to ship to customer

  // Integration type: 'manual' | 'email' | 'api' | 'shopify_collective'
  integrationType: 'email',

  // For API integrations
  apiEndpoint: null,
  apiKey: null,              // stored encrypted, never shown in UI after save

  // Which products this supplier fulfills
  // Matched by Shopify product ID or collection handle
  products: ['gid://shopify/Product/1', 'gid://shopify/Product/2'],

  // Status
  active: true,
  notes: 'Minimum order 3 units per SKU',
}
```

### New Files to Build

```
lib/
  suppliers.js              # Supplier API client + forwarding logic

app/
  api/
    webhooks/
      shopify/route.js      # Receives Shopify order webhooks (HMAC verified)
    fulfillment/
      callback/route.js     # Shopify Fulfillment Service callback (Option 2)

  admin/
    suppliers/
      page.jsx              # Supplier list (currently "Coming Soon")
      new/page.jsx          # Add supplier form
      [id]/page.jsx         # Supplier detail + connected products + order history

lib/
  mock-supplier-data.js     # Mock suppliers for dev
```

---

## Order Forwarding Flow (Option 3 — Webhooks)

### Step 1: Register the webhook in Shopify
In Shopify admin → Settings → Notifications → Webhooks:
- Event: `Order creation`
- URL: `https://yourdomain.com/api/webhooks/shopify`
- Format: JSON

### Step 2: Verify and handle the webhook
```js
// app/api/webhooks/shopify/route.js

import { verifyShopifyWebhook } from '@/lib/suppliers'

export async function POST(request) {
  // Shopify signs every webhook — verify it's really from Shopify
  const verified = await verifyShopifyWebhook(request)
  if (!verified) return new Response('Unauthorized', { status: 401 })

  const order = await request.json()

  // Find which line items need dropshipping
  const dropshipItems = order.line_items.filter(item => needsDropshipping(item))

  // Group by supplier
  const bySupplier = groupBySupplier(dropshipItems)

  // Forward each group to the right supplier
  for (const [supplierId, items] of Object.entries(bySupplier)) {
    await forwardToSupplier(supplierId, order, items)
  }

  return new Response('OK', { status: 200 })
}
```

### Step 3: Forward to supplier
```js
// lib/suppliers.js

export async function forwardToSupplier(supplierId, order, items) {
  const supplier = await getSupplier(supplierId)

  if (supplier.integrationType === 'api') {
    // Call their API
    await fetch(supplier.apiEndpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${supplier.apiKey}` },
      body: JSON.stringify(formatOrderForSupplier(order, items)),
    })
  }

  if (supplier.integrationType === 'email') {
    // Send formatted order email
    // (use Resend, Nodemailer, or Shopify Email)
    await sendOrderEmail(supplier.contactEmail, order, items)
  }
}
```

### Step 4: Update Shopify with tracking
When the supplier ships, they tell you the tracking number. You call the Shopify Admin API:
```js
// Updates the order in Shopify so the customer gets a shipping notification
await fulfillOrder(shopifyOrderId, {
  trackingNumber: 'CP123456789CA',
  trackingCompany: 'Canada Post',
  notifyCustomer: true,
})
```

---

## Webhook Security (Important)

Shopify signs every webhook with HMAC-SHA256 using your webhook secret. You **must** verify this before processing — otherwise anyone could POST fake orders to your endpoint.

```js
import crypto from 'crypto'

export async function verifyShopifyWebhook(request) {
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  const body = await request.text()
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac))
}
```

Add `SHOPIFY_WEBHOOK_SECRET` to `.env.local` — found in Shopify admin when you create the webhook.

---

## What to Add to `.env.local`

```env
SHOPIFY_WEBHOOK_SECRET=your-webhook-signing-secret
```

---

## Build Order (When Ready)

1. **Manual first** — build the suppliers admin page (list, add, edit) with manual order forwarding UI
2. **Email forwarding** — "Forward to Supplier" button generates and sends a formatted email
3. **Webhook listener** — set up the Shopify webhook endpoint for auto-forwarding
4. **API integration** — connect suppliers that have their own APIs
5. **Shopify Collective** — migrate to native if supplier joins Shopify

---

## Questions to Answer Before Building

1. **Who is the supplier?** Do they have an API, or is this email/manual?
2. **Are they on Shopify?** If yes → use Shopify Collective, skip all of the above
3. **What does a forwarded order need to contain?** Product SKU, size, quantity, shipping address, your reference number?
4. **How do they send tracking back?** Email? API callback? Manual?
5. **Do you need split fulfillment?** e.g. one order with items from two different suppliers
