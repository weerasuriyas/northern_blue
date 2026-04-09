#!/usr/bin/env node
// Seed the database with mock data.
// Run: node db/seed.js

import pg from 'pg'
import {
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_INVENTORY,
  MOCK_SUPPLIERS,
  MOCK_DISCOUNTS,
  MOCK_RETURNS,
  MOCK_REVENUE,
} from '../lib/mock-admin-data.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://northern_blue:northern_blue@localhost:5432/northern_blue',
})

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // --- Customers ---
    console.log('Seeding customers...')
    for (const c of MOCK_CUSTOMERS) {
      await client.query(
        `INSERT INTO customers (id, first_name, last_name, email, city, province, orders_count, total_spent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name  = EXCLUDED.last_name,
           email      = EXCLUDED.email,
           city       = EXCLUDED.city,
           province   = EXCLUDED.province,
           orders_count = EXCLUDED.orders_count,
           total_spent  = EXCLUDED.total_spent`,
        [c.id, c.firstName, c.lastName, c.email, c.city, c.province, c.ordersCount, c.totalSpent]
      )
    }

    // --- Orders ---
    console.log('Seeding orders...')
    for (const o of MOCK_ORDERS) {
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
          o.id, o.name, o.customerId, o.customerName, o.customerEmail,
          JSON.stringify(o.lineItems),
          o.subtotalPrice, o.totalPrice, o.currencyCode,
          o.fulfillmentStatus, o.financialStatus,
          JSON.stringify(o.shippingAddress),
          JSON.stringify(o.timeline),
          o.createdAt,
        ]
      )
    }

    // --- Inventory ---
    console.log('Seeding inventory...')
    for (const inv of MOCK_INVENTORY) {
      await client.query(
        `INSERT INTO inventory (id, product_title, variant_title, available)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET
           product_title = EXCLUDED.product_title,
           variant_title = EXCLUDED.variant_title,
           available     = EXCLUDED.available`,
        [inv.id, inv.productTitle, inv.variantTitle, inv.available]
      )
    }

    // --- Suppliers ---
    console.log('Seeding suppliers...')
    for (const s of MOCK_SUPPLIERS) {
      await client.query(
        `INSERT INTO suppliers
           (id, name, contact_name, contact_email, phone, country,
            lead_time_days, integration_type, api_endpoint, api_key,
            active, notes, product_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           name             = EXCLUDED.name,
           contact_name     = EXCLUDED.contact_name,
           contact_email    = EXCLUDED.contact_email,
           phone            = EXCLUDED.phone,
           country          = EXCLUDED.country,
           lead_time_days   = EXCLUDED.lead_time_days,
           integration_type = EXCLUDED.integration_type,
           active           = EXCLUDED.active,
           notes            = EXCLUDED.notes,
           product_count    = EXCLUDED.product_count`,
        [
          s.id, s.name, s.contactName, s.contactEmail, s.phone, s.country,
          s.leadTimeDays, s.integrationType, s.apiEndpoint, s.apiKey,
          s.active, s.notes, s.productCount,
        ]
      )
    }

    // --- Discounts ---
    console.log('Seeding discounts...')
    for (const d of MOCK_DISCOUNTS) {
      await client.query(
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
          d.id, d.code, d.type, d.value, d.minOrderAmount, d.usageLimit,
          d.usageCount, d.startsAt || null, d.expiresAt || null, d.active, d.summary,
        ]
      )
    }

    // --- Returns ---
    console.log('Seeding returns...')
    for (const r of MOCK_RETURNS) {
      await client.query(
        `INSERT INTO returns
           (id, order_id, order_name, customer_id, customer_name, customer_email,
            requested_at, reason, items, refund_amount, currency_code,
            status, timeline, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           status    = EXCLUDED.status,
           timeline  = EXCLUDED.timeline,
           notes     = EXCLUDED.notes`,
        [
          r.id, r.orderId, r.orderName, r.customerId, r.customerName, r.customerEmail,
          r.requestedAt, r.reason,
          JSON.stringify(r.items),
          r.refundAmount, r.currencyCode,
          r.status,
          JSON.stringify(r.timeline),
          r.notes,
        ]
      )
    }

    // --- Revenue ---
    console.log('Seeding revenue...')
    for (const rev of MOCK_REVENUE) {
      await client.query(
        `INSERT INTO revenue (date, amount)
         VALUES ($1,$2)
         ON CONFLICT (date) DO UPDATE SET amount = EXCLUDED.amount`,
        [rev.date, rev.amount]
      )
    }

    await client.query('COMMIT')
    console.log('✓ Seed complete')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
