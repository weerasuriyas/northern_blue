// Shopify Storefront API client.
// Currently reads from our Postgres DB (seeded with dev data).
// To wire up real Shopify:
//   1. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local
//   2. Replace the db functions below with real GraphQL calls using graphql-request.

import { query } from '@/lib/db'

// Shape a DB product row back into the Shopify Storefront API shape
// so storefront components don't need to change when we switch to real Shopify.
function toStorefrontProduct(row) {
  return {
    id:          row.id,
    title:       row.title,
    handle:      row.handle,
    description: row.description,
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

function toStorefrontCollection(row, products = []) {
  return {
    id:          row.id,
    title:       row.title,
    handle:      row.handle,
    description: row.description,
    image:       row.image ?? null,
    products:    { edges: products.map(p => ({ node: toStorefrontProduct(p) })) },
  }
}

export async function getCollections() {
  const cols = await query(`SELECT * FROM collections ORDER BY title`)
  const prods = await query(`SELECT * FROM products ORDER BY title`)

  return cols.rows.map(col =>
    toStorefrontCollection(
      col,
      prods.rows.filter(p => p.collection_handle === col.handle)
    )
  )
}

export async function getCollectionByHandle(handle) {
  const colResult = await query(
    `SELECT * FROM collections WHERE handle = $1`, [handle]
  )
  if (!colResult.rows[0]) return null

  const prodResult = await query(
    `SELECT * FROM products WHERE collection_handle = $1 ORDER BY title`, [handle]
  )
  return toStorefrontCollection(colResult.rows[0], prodResult.rows)
}

export async function getProductByHandle(handle) {
  const result = await query(
    `SELECT * FROM products WHERE handle = $1`, [handle]
  )
  return result.rows[0] ? toStorefrontProduct(result.rows[0]) : null
}

export async function getProductsByCollection(collectionHandle) {
  const result = await query(
    `SELECT * FROM products WHERE collection_handle = $1 ORDER BY title`,
    [collectionHandle]
  )
  return result.rows.map(toStorefrontProduct)
}

// --- Real Shopify implementation (swap in when tokens are ready) ---
//
// import { GraphQLClient } from 'graphql-request'
//
// const client = new GraphQLClient(
//   `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
//   { headers: { 'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN } }
// )
