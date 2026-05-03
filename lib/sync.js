// lib/sync.js
// Upsert functions called by both the webhook handler (live) and the bulk sync script.

import { query } from '@/lib/db'

// MySQL DATETIME format ('2026-04-06 14:23:00') — strips the trailing 'Z'.
function dt(iso) {
  if (iso == null) return null
  return String(iso).replace('T', ' ').replace(/\.\d+Z?$/, '').replace(/Z$/, '')
}

// --- Orders ---

export async function syncOrder(order) {
  // Shopify order shape → our DB shape
  const shippingAddress = order.shipping_address
    ? {
        city:     order.shipping_address.city,
        province: order.shipping_address.province_code,
        country:  order.shipping_address.country_code,
      }
    : null

  const lineItems = (order.line_items || []).map(item => ({
    title:        item.title,
    variantTitle: item.variant_title,
    quantity:     item.quantity,
    price:        item.price,
  }))

  const timeline = [
    { at: order.created_at, message: 'Order placed' },
    ...(order.fulfillment_status === 'fulfilled'
      ? [{ at: order.updated_at, message: 'Order fulfilled and shipped' }]
      : []),
  ]

  await query(
    `INSERT INTO orders
       (id, name, customer_id, customer_name, customer_email,
        line_items, subtotal_price, total_price, currency_code,
        fulfillment_status, financial_status, shipping_address, timeline, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON DUPLICATE KEY UPDATE
       name               = VALUES(name),
       customer_name      = VALUES(customer_name),
       customer_email     = VALUES(customer_email),
       line_items         = VALUES(line_items),
       subtotal_price     = VALUES(subtotal_price),
       total_price        = VALUES(total_price),
       fulfillment_status = VALUES(fulfillment_status),
       financial_status   = VALUES(financial_status),
       shipping_address   = VALUES(shipping_address),
       timeline           = VALUES(timeline)`,
    [
      String(order.id),
      order.name,
      order.customer ? String(order.customer.id) : null,
      order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : order.billing_address?.name ?? null,
      order.customer?.email ?? order.email ?? null,
      JSON.stringify(lineItems),
      order.subtotal_price,
      order.total_price,
      order.currency,
      order.fulfillment_status ?? 'unfulfilled',
      order.financial_status ?? 'pending',
      JSON.stringify(shippingAddress),
      JSON.stringify(timeline),
      dt(order.created_at),
    ]
  )

  // Upsert the customer while we have the data
  if (order.customer) {
    await syncCustomer(order.customer)
  }

  // Recalculate daily revenue for this order's date
  await deriveRevenue(order.created_at.slice(0, 10))
}

// --- Customers ---

export async function syncCustomer(customer) {
  await query(
    `INSERT INTO customers
       (id, first_name, last_name, email, city, province, orders_count, total_spent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON DUPLICATE KEY UPDATE
       first_name   = VALUES(first_name),
       last_name    = VALUES(last_name),
       email        = VALUES(email),
       city         = VALUES(city),
       province     = VALUES(province),
       orders_count = VALUES(orders_count),
       total_spent  = VALUES(total_spent)`,
    [
      String(customer.id),
      customer.first_name,
      customer.last_name,
      customer.email,
      customer.default_address?.city ?? null,
      customer.default_address?.province_code ?? null,
      customer.orders_count ?? 0,
      customer.total_spent ?? '0.00',
    ]
  )
}

// --- Inventory ---

export async function syncInventoryLevel(level, productTitle, variantTitle) {
  // Shopify uses inventory_item_id as the key
  const id = `inv-${level.inventory_item_id}`
  await query(
    `INSERT INTO inventory (id, product_title, variant_title, available)
     VALUES ($1,$2,$3,$4)
     ON DUPLICATE KEY UPDATE
       product_title = VALUES(product_title),
       variant_title = VALUES(variant_title),
       available     = VALUES(available)`,
    [id, productTitle, variantTitle, level.available]
  )
}

// --- Revenue (derived from orders) ---

export async function deriveRevenue(date) {
  // Sum all paid orders for the given date and upsert the revenue row.
  // mysql2 placeholders are positional — pass `date` twice for the two refs.
  await query(
    `INSERT INTO revenue (date, amount)
     SELECT
       $1,
       COALESCE(SUM(total_price), 0)
     FROM orders
     WHERE DATE(created_at) = $2
       AND financial_status = 'paid'
     ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
    [date, date]
  )
}

