// Shopify Admin API helpers — stub implementation.
// All functions call /api/admin/* which validates JWT and returns mock data.
// To wire up Shopify: update /api/admin/[...path]/route.js to proxy to
// https://{store}.myshopify.com/admin/api/2024-01/{path} with the private token.

export async function adminFetch(path, options = {}) {
  const res = await fetch(`/api/admin/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`)
  return res.json()
}

export const getDashboardStats = () => adminFetch('dashboard')
export const getProducts = () => adminFetch('products.json')
export const getProduct = (id) => adminFetch(`products/${id}.json`)
export const createProduct = (data) => adminFetch('products.json', { method: 'POST', body: JSON.stringify({ product: data }) })
export const updateProduct = (id, data) => adminFetch(`products/${id}.json`, { method: 'PUT', body: JSON.stringify({ product: data }) })

export const getOrders = () => adminFetch('orders.json')
export const getOrder = (id) => adminFetch(`orders/${id}.json`)
export const fulfillOrder = (id) => adminFetch(`orders/${id}/fulfillments.json`, { method: 'POST', body: JSON.stringify({}) })

export const getCustomers = () => adminFetch('customers.json')
export const getCustomer = (id) => adminFetch(`customers/${id}.json`)

export const getInventoryLevels = () => adminFetch('inventory/levels.json')
