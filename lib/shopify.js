// Shopify Storefront API client.
// Currently returns mock data. To wire up Shopify:
//   1. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local
//   2. Replace the stub functions below with real GraphQL calls using graphql-request.

import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from './mock-data.js'

// --- Stub implementations (mock data) ---

export async function getCollections() {
  return MOCK_COLLECTIONS
}

export async function getCollectionByHandle(handle) {
  return MOCK_COLLECTIONS.find(c => c.handle === handle) ?? null
}

export async function getProductByHandle(handle) {
  return MOCK_PRODUCTS.find(p => p.handle === handle) ?? null
}

export async function getProductsByCollection(collectionHandle) {
  return MOCK_PRODUCTS.filter(p => p.collectionHandle === collectionHandle)
}

// --- Real implementation (uncomment and replace stubs above when ready) ---
//
// import { GraphQLClient } from 'graphql-request'
//
// const client = new GraphQLClient(
//   `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
//   {
//     headers: {
//       'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
//     },
//   }
// )
//
// export async function getCollections() { ... }
// export async function getCollectionByHandle(handle) { ... }
// export async function getProductByHandle(handle) { ... }
