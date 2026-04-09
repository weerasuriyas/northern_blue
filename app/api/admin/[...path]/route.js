import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

// Reshape a DB products row into Shopify Storefront API shape
// so admin UI components stay consistent with the storefront shape.
function toStorefrontShape(row) {
  return {
    id:               row.id,
    title:            row.title,
    handle:           row.handle,
    description:      row.description,
    collectionHandle: row.collection_handle,
    priceRange: {
      minVariantPrice: {
        amount:       row.price_min?.toString() ?? '0',
        currencyCode: row.currency_code ?? 'CAD',
      },
    },
    images:   { edges: (row.images   ?? []).map(img => ({ node: img })) },
    variants: { edges: (row.variants ?? []).map(v   => ({ node: v   })) },
  }
}

async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('nb-admin-token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request, { params }) {
  const authError = await requireAuth()
  if (authError) return authError

  const path = (await params).path.join('/')

  // --- Dashboard ---
  if (path === 'dashboard') {
    const [revenue, orders, customers] = await Promise.all([
      query(`SELECT COALESCE(SUM(amount),0) AS total FROM revenue
             WHERE date >= date_trunc('month', CURRENT_DATE)`),
      query(`SELECT COUNT(*) AS count FROM orders
             WHERE created_at >= date_trunc('month', CURRENT_DATE)`),
      query(`SELECT COUNT(*) AS count FROM customers`),
    ])
    const revenueThisMonth = Number(revenue.rows[0].total).toFixed(2)
    const ordersThisMonth = Number(orders.rows[0].count)
    const totalCustomers = Number(customers.rows[0].count)
    const avgOrderValue = ordersThisMonth > 0
      ? (Number(revenueThisMonth) / ordersThisMonth).toFixed(2)
      : '0.00'
    const revenueChart = await query(`SELECT COALESCE(SUM(amount),0) AS total FROM revenue`)
    return NextResponse.json({
      revenueThisMonth,
      ordersThisMonth,
      totalCustomers,
      avgOrderValue,
      currencyCode: 'CAD',
      revenueChartTotal: Number(revenueChart.rows[0].total).toFixed(2),
    })
  }

  // --- Revenue chart ---
  if (path === 'revenue.json') {
    const result = await query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS date, amount::float AS amount
       FROM revenue ORDER BY date`
    )
    return NextResponse.json({ revenue: result.rows })
  }

  // --- Products ---
  if (path === 'products.json') {
    const result = await query(`SELECT * FROM products ORDER BY title`)
    return NextResponse.json({ products: result.rows.map(toStorefrontShape) })
  }
  const productMatch = path.match(/^products\/([^/]+)\.json$/)
  if (productMatch) {
    const result = await query(
      `SELECT * FROM products WHERE id = $1 OR handle = $2`,
      [productMatch[1], productMatch[1]]
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product: toStorefrontShape(result.rows[0]) })
  }

  // --- Orders ---
  if (path === 'orders.json') {
    const result = await query(
      `SELECT o.id, o.name,
              o.customer_id AS "customerId", o.customer_name AS "customerName",
              o.customer_email AS "customerEmail", o.line_items AS "lineItems",
              o.subtotal_price::text AS "subtotalPrice", o.total_price::text AS "totalPrice",
              o.currency_code AS "currencyCode", o.fulfillment_status AS "fulfillmentStatus",
              o.financial_status AS "financialStatus", o.shipping_address AS "shippingAddress",
              o.timeline, to_char(o.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
              (
                SELECT json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name))
                FROM jsonb_array_elements(o.line_items) AS li
                JOIN products p ON p.title = li->>'title'
                JOIN suppliers s ON s.id = p.supplier_id
              ) AS suppliers
       FROM orders o ORDER BY o.created_at DESC`
    )
    return NextResponse.json({ orders: result.rows })
  }
  const orderMatch = path.match(/^orders\/([^/]+)\.json$/)
  if (orderMatch) {
    const result = await query(
      `SELECT o.id, o.name,
              o.customer_id AS "customerId", o.customer_name AS "customerName",
              o.customer_email AS "customerEmail",
              o.subtotal_price::text AS "subtotalPrice", o.total_price::text AS "totalPrice",
              o.currency_code AS "currencyCode", o.fulfillment_status AS "fulfillmentStatus",
              o.financial_status AS "financialStatus", o.shipping_address AS "shippingAddress",
              o.timeline, to_char(o.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
              (
                SELECT json_agg(
                  jsonb_build_object(
                    'title',        li->>'title',
                    'variantTitle', li->>'variantTitle',
                    'quantity',     li->>'quantity',
                    'price',        li->>'price',
                    'supplier',     jsonb_build_object('id', s.id, 'name', s.name)
                  )
                )
                FROM jsonb_array_elements(o.line_items) AS li
                LEFT JOIN products p ON p.title = li->>'title'
                LEFT JOIN suppliers s ON s.id = p.supplier_id
              ) AS "lineItems"
       FROM orders o WHERE o.id = $1 OR o.name = $2`,
      [orderMatch[1], orderMatch[1]]
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ order: result.rows[0] })
  }

  // --- Customers ---
  if (path === 'customers.json') {
    const result = await query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email,
              city, province, orders_count AS "ordersCount", total_spent::text AS "totalSpent"
       FROM customers ORDER BY last_name, first_name`
    )
    return NextResponse.json({ customers: result.rows })
  }
  const customerMatch = path.match(/^customers\/([^/]+)\.json$/)
  if (customerMatch) {
    const cResult = await query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email,
              city, province, orders_count AS "ordersCount", total_spent::text AS "totalSpent"
       FROM customers WHERE id = $1`,
      [customerMatch[1]]
    )
    if (!cResult.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const oResult = await query(
      `SELECT id, name, line_items AS "lineItems",
              total_price::text AS "totalPrice", currency_code AS "currencyCode",
              fulfillment_status AS "fulfillmentStatus", financial_status AS "financialStatus",
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
       FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [customerMatch[1]]
    )
    return NextResponse.json({ customer: cResult.rows[0], orders: oResult.rows })
  }

  // --- Returns ---
  if (path === 'returns.json') {
    const result = await query(
      `SELECT id, order_id AS "orderId", order_name AS "orderName",
              customer_id AS "customerId", customer_name AS "customerName",
              customer_email AS "customerEmail",
              to_char(requested_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "requestedAt",
              reason, items, refund_amount::text AS "refundAmount",
              currency_code AS "currencyCode", status, timeline, notes
       FROM returns ORDER BY requested_at DESC`
    )
    return NextResponse.json({ returns: result.rows })
  }
  const returnMatch = path.match(/^returns\/([^/]+)\.json$/)
  if (returnMatch) {
    const result = await query(
      `SELECT id, order_id AS "orderId", order_name AS "orderName",
              customer_id AS "customerId", customer_name AS "customerName",
              customer_email AS "customerEmail",
              to_char(requested_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "requestedAt",
              reason, items, refund_amount::text AS "refundAmount",
              currency_code AS "currencyCode", status, timeline, notes
       FROM returns WHERE id = $1`,
      [returnMatch[1]]
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ return: result.rows[0] })
  }

  // --- Suppliers ---
  if (path === 'suppliers.json') {
    const result = await query(
      `SELECT id, name, contact_name AS "contactName", contact_email AS "contactEmail",
              phone, country, lead_time_days AS "leadTimeDays",
              integration_type AS "integrationType", api_endpoint AS "apiEndpoint",
              active, notes, product_count AS "productCount"
       FROM suppliers ORDER BY name`
    )
    return NextResponse.json({ suppliers: result.rows })
  }
  const supplierMatch = path.match(/^suppliers\/([^/]+)\.json$/)
  if (supplierMatch) {
    const result = await query(
      `SELECT id, name, contact_name AS "contactName", contact_email AS "contactEmail",
              phone, country, lead_time_days AS "leadTimeDays",
              integration_type AS "integrationType", api_endpoint AS "apiEndpoint",
              active, notes, product_count AS "productCount"
       FROM suppliers WHERE id = $1`,
      [supplierMatch[1]]
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ supplier: result.rows[0] })
  }

  // --- Inventory ---
  if (path === 'inventory/levels.json') {
    const result = await query(
      `SELECT id, product_title AS "productTitle", variant_title AS "variantTitle", available
       FROM inventory ORDER BY product_title, variant_title`
    )
    return NextResponse.json({ inventory: result.rows })
  }

  // --- Discounts ---
  if (path === 'discounts.json') {
    const result = await query(
      `SELECT id, code, type, value::float AS value,
              min_order_amount::text AS "minOrderAmount",
              usage_limit AS "usageLimit", usage_count AS "usageCount",
              to_char(starts_at, 'YYYY-MM-DD') AS "startsAt",
              to_char(expires_at, 'YYYY-MM-DD') AS "expiresAt",
              active, summary
       FROM discounts ORDER BY created_at DESC`
    )
    return NextResponse.json({ discounts: result.rows })
  }
  const discountMatch = path.match(/^discounts\/([^/]+)\.json$/)
  if (discountMatch) {
    const result = await query(
      `SELECT id, code, type, value::float AS value,
              min_order_amount::text AS "minOrderAmount",
              usage_limit AS "usageLimit", usage_count AS "usageCount",
              to_char(starts_at, 'YYYY-MM-DD') AS "startsAt",
              to_char(expires_at, 'YYYY-MM-DD') AS "expiresAt",
              active, summary
       FROM discounts WHERE id = $1`,
      [discountMatch[1]]
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ discount: result.rows[0] })
  }

  // --- Settings ---
  if (path === 'settings.json') {
    const result = await query(`SELECT key, value FROM settings`)
    const settings = Object.fromEntries(result.rows.map(r => [r.key, r.value]))
    return NextResponse.json({
      storeName: settings.store_name,
      email:     settings.email,
      currency:  settings.currency,
      timezone:  settings.timezone,
      country:   settings.country,
    })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request, { params }) {
  const authError = await requireAuth()
  if (authError) return authError

  const path = (await params).path.join('/')
  const body = await request.json().catch(() => ({}))

  // Fulfillment stub
  const fulfillMatch = path.match(/^orders\/([^/]+)\/fulfillments\.json$/)
  if (fulfillMatch) {
    return NextResponse.json({ fulfillment: { id: 'stub-fulfillment', status: 'success' } })
  }

  // Create supplier
  if (path === 'suppliers.json') {
    const id = `sup-${Date.now()}`
    await query(
      `INSERT INTO suppliers (id, name, contact_name, contact_email, phone, country,
         lead_time_days, integration_type, api_endpoint, api_key, active, notes, product_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,0)`,
      [
        id, body.name, body.contactName, body.contactEmail, body.phone, body.country,
        body.leadTimeDays || 7, body.integrationType || 'manual',
        body.apiEndpoint || null, body.apiKey || null,
        body.active !== false, body.notes || '',
      ]
    )
    return NextResponse.json({ ok: true, supplier: { id } })
  }

  // Create discount
  if (path === 'discounts.json') {
    const id = `disc-${Date.now()}`
    await query(
      `INSERT INTO discounts (id, code, type, value, min_order_amount, usage_limit,
         usage_count, starts_at, expires_at, active, summary)
       VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8,$9,$10)`,
      [
        id, body.code?.toUpperCase(), body.type, body.value || 0,
        body.minOrderAmount || 0, body.usageLimit || null,
        body.startsAt || null, body.expiresAt || null,
        body.active !== false,
        body.summary || '',
      ]
    )
    return NextResponse.json({ ok: true, discount: { id } })
  }

  // Returns actions
  const approveMatch = path.match(/^returns\/([^/]+)\/approve\.json$/)
  if (approveMatch) {
    await query(
      `UPDATE returns SET status = 'approved',
         timeline = timeline || $2::jsonb
       WHERE id = $1`,
      [approveMatch[1], JSON.stringify([{ at: new Date().toISOString(), message: 'Return approved by admin' }])]
    )
    return NextResponse.json({ ok: true })
  }
  const declineMatch = path.match(/^returns\/([^/]+)\/decline\.json$/)
  if (declineMatch) {
    await query(
      `UPDATE returns SET status = 'declined',
         timeline = timeline || $2::jsonb
       WHERE id = $1`,
      [declineMatch[1], JSON.stringify([{ at: new Date().toISOString(), message: 'Return declined by admin' }])]
    )
    return NextResponse.json({ ok: true })
  }
  const refundMatch = path.match(/^returns\/([^/]+)\/refund\.json$/)
  if (refundMatch) {
    const ret = await query(`SELECT refund_amount, currency_code FROM returns WHERE id = $1`, [refundMatch[1]])
    const r = ret.rows[0]
    await query(
      `UPDATE returns SET status = 'refunded',
         timeline = timeline || $2::jsonb
       WHERE id = $1`,
      [refundMatch[1], JSON.stringify([{ at: new Date().toISOString(), message: `Refund of $${r?.refund_amount} ${r?.currency_code} issued` }])]
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

export async function PUT(request, { params }) {
  const authError = await requireAuth()
  if (authError) return authError

  const path = (await params).path.join('/')

  // Toggle discount active state
  const toggleMatch = path.match(/^discounts\/([^/]+)\/toggle\.json$/)
  if (toggleMatch) {
    await query(
      `UPDATE discounts SET active = NOT active WHERE id = $1`,
      [toggleMatch[1]]
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
