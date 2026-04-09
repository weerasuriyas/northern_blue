// lib/sync.js
// Upsert functions called by both the webhook handler (live) and the bulk sync script.

import { query } from '@/lib/db'

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
     ON CONFLICT (id) DO UPDATE SET
       name               = EXCLUDED.name,
       customer_name      = EXCLUDED.customer_name,
       customer_email     = EXCLUDED.customer_email,
       line_items         = EXCLUDED.line_items,
       subtotal_price     = EXCLUDED.subtotal_price,
       total_price        = EXCLUDED.total_price,
       fulfillment_status = EXCLUDED.fulfillment_status,
       financial_status   = EXCLUDED.financial_status,
       shipping_address   = EXCLUDED.shipping_address,
       timeline           = EXCLUDED.timeline`,
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
      order.created_at,
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
     ON CONFLICT (id) DO UPDATE SET
       first_name   = EXCLUDED.first_name,
       last_name    = EXCLUDED.last_name,
       email        = EXCLUDED.email,
       city         = EXCLUDED.city,
       province     = EXCLUDED.province,
       orders_count = EXCLUDED.orders_count,
       total_spent  = EXCLUDED.total_spent`,
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
     ON CONFLICT (id) DO UPDATE SET
       product_title = EXCLUDED.product_title,
       variant_title = EXCLUDED.variant_title,
       available     = EXCLUDED.available`,
    [id, productTitle, variantTitle, level.available]
  )
}

// --- Revenue (derived from orders) ---

export async function deriveRevenue(date) {
  // Sum all paid orders for the given date and upsert the revenue row
  await query(
    `INSERT INTO revenue (date, amount)
     SELECT
       $1::date,
       COALESCE(SUM(total_price), 0)
     FROM orders
     WHERE DATE(created_at) = $1::date
       AND financial_status = 'paid'
     ON CONFLICT (date) DO UPDATE SET amount = EXCLUDED.amount`,
    [date]
  )
}

// --- Discounts ---

export async function syncDiscount(priceRule, discountCode) {
  const id = `shopify-${priceRule.id}`
  const type =
    priceRule.value_type === 'percentage'     ? 'percentage'   :
    priceRule.value_type === 'fixed_amount'   ? 'fixed_amount' :
    'free_shipping'

  const value = Math.abs(Number(priceRule.value))

  await query(
    `INSERT INTO discounts
       (id, code, type, value, min_order_amount, usage_limit,
        usage_count, starts_at, expires_at, active, summary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       code             = EXCLUDED.code,
       type             = EXCLUDED.type,
       value            = EXCLUDED.value,
       min_order_amount = EXCLUDED.min_order_amount,
       usage_limit      = EXCLUDED.usage_limit,
       usage_count      = EXCLUDED.usage_count,
       starts_at        = EXCLUDED.starts_at,
       expires_at       = EXCLUDED.expires_at,
       active           = EXCLUDED.active,
       summary          = EXCLUDED.summary`,
    [
      id,
      discountCode.code,
      type,
      value,
      priceRule.prerequisite_subtotal_range?.greater_than_or_equal_to ?? '0',
      priceRule.usage_limit ?? null,
      discountCode.usage_count ?? 0,
      priceRule.starts_at ? priceRule.starts_at.slice(0, 10) : null,
      priceRule.ends_at   ? priceRule.ends_at.slice(0, 10)   : null,
      true,
      type === 'percentage'
        ? `${value}% off`
        : type === 'fixed_amount'
        ? `$${value} off`
        : 'Free shipping',
    ]
  )
}
