// app/api/webhooks/shopify/route.js
// Receives all Shopify webhooks. Register in Shopify admin → Settings → Notifications → Webhooks.
// URL: https://yourdomain.com/api/webhooks/shopify

import crypto from 'crypto'
import { syncOrder, syncCustomer, syncInventoryLevel } from '@/lib/sync'

async function verifyShopifyWebhook(request, rawBody) {
  const hmac = request.headers.get('x-shopify-hmac-sha256')
  if (!hmac) return false

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('SHOPIFY_WEBHOOK_SECRET not set — skipping webhook verification')
    return true // allow in dev without the secret
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac))
  } catch {
    return false
  }
}

export async function POST(request) {
  const rawBody = await request.text()

  const verified = await verifyShopifyWebhook(request, rawBody)
  if (!verified) {
    console.error('Webhook HMAC verification failed')
    return new Response('Unauthorized', { status: 401 })
  }

  const topic = request.headers.get('x-shopify-topic')
  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  console.log(`Webhook received: ${topic}`)

  try {
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
      case 'orders/fulfilled':
        await syncOrder(payload)
        break

      case 'customers/create':
      case 'customers/update':
        await syncCustomer(payload)
        break

      case 'inventory_levels/update':
        // Shopify sends inventory_item_id + available but not the product/variant name.
        // We store what we have; the bulk sync script fills in titles.
        await syncInventoryLevel(payload, 'Unknown', '')
        break

      default:
        // Unknown topic — log and ignore (don't return an error or Shopify will retry)
        console.log(`Unhandled webhook topic: ${topic}`)
    }
  } catch (err) {
    // Log the error but still return 200 — if we return 5xx Shopify will retry
    // and we'd end up with duplicate processing attempts
    console.error(`Error handling webhook ${topic}:`, err.message)
  }

  // Shopify expects a 200 response within 5 seconds
  return new Response('OK', { status: 200 })
}
