#!/usr/bin/env node
// Bulk sync from Shopify Admin API → Postgres.
// Run before go-live, or after downtime to catch missed webhooks.
//
//   npm run db:sync              — sync everything
//   npm run db:sync -- orders    — sync only orders
//   npm run db:sync -- customers — sync only customers
//   npm run db:sync -- inventory — sync only inventory
//   npm run db:sync -- discounts — sync only discounts

import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://northern_blue:northern_blue@localhost:5432/northern_blue',
})

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const SHOPIFY_TOKEN  = process.env.SHOPIFY_ADMIN_API_TOKEN
const API_VERSION    = '2024-10'

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
  console.warn('⚠  SHOPIFY_DOMAIN or SHOPIFY_ADMIN_API_TOKEN not set.')
  console.warn('   Running in dry-run mode — no Shopify API calls will be made.')
}

// --- Shopify API helpers ---

async function shopifyGet(path) {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) return null
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}${path}`
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Shopify API ${res.status}: ${path}`)
  return res.json()
}

// Fetch all pages of a resource (Shopify uses Link header pagination)
async function shopifyGetAll(path, key) {
  const results = []
  let url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}${path}`

  while (url) {
    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) break
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Shopify API ${res.status}: ${url}`)
    const data = await res.json()
    results.push(...(data[key] || []))

    // Follow Link: <next_url>; rel="next" header
    const link = res.headers.get('Link') || ''
    const next = link.match(/<([^>]+)>;\s*rel="next"/)
    url = next ? next[1] : null
  }

  return results
}

// --- Sync functions ---

async function syncCustomers(client) {
  console.log('Syncing customers...')
  const customers = await shopifyGetAll('/customers.json?limit=250', 'customers')
  if (!customers.length) { console.log('  (no data — Shopify not connected)'); return }

  for (const c of customers) {
    await client.query(
      `INSERT INTO customers
         (id, first_name, last_name, email, city, province, orders_count, total_spent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         first_name   = EXCLUDED.first_name,
         last_name    = EXCLUDED.last_name,
         email        = EXCLUDED.email,
         city         = EXCLUDED.city,
         province     = EXCLUDED.province,
         orders_count = EXCLUDED.orders_count,
         total_spent  = EXCLUDED.total_spent`,
      [
        String(c.id),
        c.first_name, c.last_name, c.email,
        c.default_address?.city ?? null,
        c.default_address?.province_code ?? null,
        c.orders_count ?? 0,
        c.total_spent ?? '0.00',
      ]
    )
  }
  console.log(`  ✓ ${customers.length} customers`)
}

async function syncOrders(client) {
  console.log('Syncing orders...')
  const orders = await shopifyGetAll('/orders.json?status=any&limit=250', 'orders')
  if (!orders.length) { console.log('  (no data — Shopify not connected)'); return }

  const revenueDates = new Set()

  for (const o of orders) {
    const shippingAddress = o.shipping_address
      ? { city: o.shipping_address.city, province: o.shipping_address.province_code, country: o.shipping_address.country_code }
      : null

    const lineItems = (o.line_items || []).map(item => ({
      title: item.title, variantTitle: item.variant_title,
      quantity: item.quantity, price: item.price,
    }))

    await client.query(
      `INSERT INTO orders
         (id, name, customer_id, customer_name, customer_email,
          line_items, subtotal_price, total_price, currency_code,
          fulfillment_status, financial_status, shipping_address, timeline, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         name               = EXCLUDED.name,
         line_items         = EXCLUDED.line_items,
         subtotal_price     = EXCLUDED.subtotal_price,
         total_price        = EXCLUDED.total_price,
         fulfillment_status = EXCLUDED.fulfillment_status,
         financial_status   = EXCLUDED.financial_status,
         shipping_address   = EXCLUDED.shipping_address,
         timeline           = EXCLUDED.timeline`,
      [
        String(o.id), o.name,
        o.customer ? String(o.customer.id) : null,
        o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : null,
        o.customer?.email ?? o.email ?? null,
        JSON.stringify(lineItems),
        o.subtotal_price, o.total_price, o.currency,
        o.fulfillment_status ?? 'unfulfilled',
        o.financial_status ?? 'pending',
        JSON.stringify(shippingAddress),
        JSON.stringify([{ at: o.created_at, message: 'Order placed' }]),
        o.created_at,
      ]
    )
    revenueDates.add(o.created_at.slice(0, 10))
  }

  // Recalculate revenue for all affected dates
  for (const date of revenueDates) {
    await client.query(
      `INSERT INTO revenue (date, amount)
       SELECT $1::date, COALESCE(SUM(total_price), 0)
       FROM orders
       WHERE DATE(created_at) = $1::date AND financial_status = 'paid'
       ON CONFLICT (date) DO UPDATE SET amount = EXCLUDED.amount`,
      [date]
    )
  }
  console.log(`  ✓ ${orders.length} orders, revenue recalculated for ${revenueDates.size} dates`)
}

async function syncInventory(client) {
  console.log('Syncing inventory...')
  // To get titles we need to go through products → variants → inventory_item_id
  const products = await shopifyGetAll('/products.json?limit=250', 'products')
  if (!products.length) { console.log('  (no data — Shopify not connected)'); return }

  let count = 0
  for (const product of products) {
    for (const variant of product.variants || []) {
      const levels = await shopifyGet(
        `/inventory_levels.json?inventory_item_ids=${variant.inventory_item_id}`
      )
      const available = levels?.inventory_levels?.[0]?.available ?? 0
      const id = `inv-${variant.inventory_item_id}`

      await client.query(
        `INSERT INTO inventory (id, product_title, variant_title, available)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET
           product_title = EXCLUDED.product_title,
           variant_title = EXCLUDED.variant_title,
           available     = EXCLUDED.available`,
        [id, product.title, variant.title, available]
      )
      count++
    }
  }
  console.log(`  ✓ ${count} inventory rows`)
}

async function syncDiscounts(client) {
  console.log('Syncing discounts...')
  const priceRules = await shopifyGetAll('/price_rules.json?limit=250', 'price_rules')
  if (!priceRules.length) { console.log('  (no data — Shopify not connected)'); return }

  let count = 0
  for (const rule of priceRules) {
    const codesData = await shopifyGet(`/price_rules/${rule.id}/discount_codes.json`)
    for (const code of codesData?.discount_codes || []) {
      const type =
        rule.value_type === 'percentage'   ? 'percentage'   :
        rule.value_type === 'fixed_amount' ? 'fixed_amount' :
        'free_shipping'
      const value = Math.abs(Number(rule.value))

      await client.query(
        `INSERT INTO discounts
           (id, code, type, value, min_order_amount, usage_limit,
            usage_count, starts_at, expires_at, active, summary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code, type = EXCLUDED.type,
           value = EXCLUDED.value, usage_count = EXCLUDED.usage_count,
           active = EXCLUDED.active`,
        [
          `shopify-${rule.id}`,
          code.code, type, value,
          rule.prerequisite_subtotal_range?.greater_than_or_equal_to ?? '0',
          rule.usage_limit ?? null,
          code.usage_count ?? 0,
          rule.starts_at?.slice(0, 10) ?? null,
          rule.ends_at?.slice(0, 10)   ?? null,
          true,
          type === 'percentage' ? `${value}% off` : type === 'fixed_amount' ? `$${value} off` : 'Free shipping',
        ]
      )
      count++
    }
  }
  console.log(`  ✓ ${count} discount codes`)
}

// --- Main ---

async function main() {
  const target = process.argv[2] // optional: 'orders' | 'customers' | 'inventory' | 'discounts'
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!target || target === 'customers') await syncCustomers(client)
    if (!target || target === 'orders')    await syncOrders(client)
    if (!target || target === 'inventory') await syncInventory(client)
    if (!target || target === 'discounts') await syncDiscounts(client)

    await client.query('COMMIT')
    console.log('✓ Sync complete')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Sync failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
