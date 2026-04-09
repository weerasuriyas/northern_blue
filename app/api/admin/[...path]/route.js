import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import {
  MOCK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_INVENTORY,
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE,
  MOCK_SUPPLIERS,
  MOCK_DISCOUNTS,
  MOCK_RETURNS,
} from '@/lib/mock-admin-data'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

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
    return NextResponse.json(MOCK_DASHBOARD_STATS)
  }

  // --- Revenue chart ---
  if (path === 'revenue.json') {
    return NextResponse.json({ revenue: MOCK_REVENUE })
  }

  // --- Products ---
  if (path === 'products.json') {
    return NextResponse.json({ products: MOCK_PRODUCTS })
  }
  const productMatch = path.match(/^products\/([^/]+)\.json$/)
  if (productMatch) {
    const product = MOCK_PRODUCTS.find(p => p.id === productMatch[1] || p.handle === productMatch[1])
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
  }

  // --- Orders ---
  if (path === 'orders.json') {
    return NextResponse.json({ orders: MOCK_ORDERS })
  }
  const orderMatch = path.match(/^orders\/([^/]+)\.json$/)
  if (orderMatch) {
    const order = MOCK_ORDERS.find(o => o.id === orderMatch[1] || o.name === orderMatch[1])
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ order })
  }

  // --- Customers ---
  if (path === 'customers.json') {
    return NextResponse.json({ customers: MOCK_CUSTOMERS })
  }
  const customerMatch = path.match(/^customers\/([^/]+)\.json$/)
  if (customerMatch) {
    const customer = MOCK_CUSTOMERS.find(c => c.id === customerMatch[1])
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const orders = MOCK_ORDERS.filter(o => o.customerId === customer.id)
    return NextResponse.json({ customer, orders })
  }

  // --- Returns ---
  if (path === 'returns.json') {
    return NextResponse.json({ returns: MOCK_RETURNS })
  }
  const returnMatch = path.match(/^returns\/([^/]+)\.json$/)
  if (returnMatch) {
    const ret = MOCK_RETURNS.find(r => r.id === returnMatch[1])
    if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ return: ret })
  }

  // --- Suppliers ---
  if (path === 'suppliers.json') {
    return NextResponse.json({ suppliers: MOCK_SUPPLIERS })
  }
  const supplierMatch = path.match(/^suppliers\/([^/]+)\.json$/)
  if (supplierMatch) {
    const supplier = MOCK_SUPPLIERS.find(s => s.id === supplierMatch[1])
    if (!supplier) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ supplier })
  }

  // --- Inventory ---
  if (path === 'inventory/levels.json') {
    return NextResponse.json({ inventory: MOCK_INVENTORY })
  }

  // --- Discounts ---
  if (path === 'discounts.json') {
    return NextResponse.json({ discounts: MOCK_DISCOUNTS })
  }
  const discountMatch = path.match(/^discounts\/([^/]+)\.json$/)
  if (discountMatch) {
    const discount = MOCK_DISCOUNTS.find(d => d.id === discountMatch[1])
    if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ discount })
  }

  // --- Settings ---
  if (path === 'settings.json') {
    return NextResponse.json({
      storeName: 'Northern Blue',
      email: 'admin@northernblue.ca',
      currency: 'CAD',
      timezone: 'America/Toronto',
      country: 'Canada',
    })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request, { params }) {
  const authError = await requireAuth()
  if (authError) return authError

  const path = (await params).path.join('/')

  // Fulfillment stub
  const fulfillMatch = path.match(/^orders\/([^/]+)\/fulfillments\.json$/)
  if (fulfillMatch) {
    return NextResponse.json({ fulfillment: { id: 'stub-fulfillment', status: 'success' } })
  }

  // Suppliers stub
  if (path === 'suppliers.json') {
    return NextResponse.json({ ok: true, supplier: { id: `sup-${Date.now()}` } })
  }

  // Discounts stub
  if (path === 'discounts.json') {
    return NextResponse.json({ ok: true })
  }

  // Returns action stubs
  if (path.match(/^returns\/([^/]+)\/approve\.json$/)) {
    return NextResponse.json({ ok: true })
  }
  if (path.match(/^returns\/([^/]+)\/decline\.json$/)) {
    return NextResponse.json({ ok: true })
  }
  if (path.match(/^returns\/([^/]+)\/refund\.json$/)) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

export async function PUT(request, { params }) {
  const authError = await requireAuth()
  if (authError) return authError

  const path = (await params).path.join('/')

  // Discount active toggle stub
  const toggleMatch = path.match(/^discounts\/([^/]+)\/toggle\.json$/)
  if (toggleMatch) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
