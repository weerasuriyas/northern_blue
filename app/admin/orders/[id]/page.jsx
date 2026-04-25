'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatusBadge from '@/admin/components/StatusBadge'
import OrderTimeline from '@/admin/components/OrderTimeline'
import { formatCurrency } from '@/lib/formatCurrency'
import toast from 'react-hot-toast'

const SO_STATUS_STYLES = {
  pending:   'bg-gray-100 text-gray-600 border-gray-200',
  sent:      'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped:   'bg-green-50 text-green-700 border-green-200',
}

function SupplierOrderCard({ so, onTrackingUpdate }) {
  const [showTracking, setShowTracking] = useState(false)
  const [tracking, setTracking] = useState({ number: '', company: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/admin/supplier-orders/${so.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: tracking.number, trackingCompany: tracking.company, status: 'shipped' }),
      })
      toast.success('Tracking updated')
      setShowTracking(false)
      onTrackingUpdate(so.id, tracking.number, tracking.company)
    } catch {
      toast.error('Failed to update tracking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-nb-navy">{so.supplierName}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: {so.reference}</p>
        </div>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${SO_STATUS_STYLES[so.status] ?? SO_STATUS_STYLES.sent}`}>
          {so.status}
        </span>
      </div>

      <div className="space-y-1">
        {so.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm gap-2">
            <div>
              <span className="text-gray-700">{item.title}</span>
              <span className="text-gray-400"> × {item.quantity}</span>
              <span className="text-gray-400 text-xs"> ({item.variantTitle})</span>
              {item.sku && <span className="ml-2 font-mono text-xs text-gray-400">{item.sku}</span>}
            </div>
            <span className="text-nb-navy font-medium shrink-0">{formatCurrency(item.lineTotal ?? item.price, 'CAD')}</span>
          </div>
        ))}
      </div>

      {so.shippingAddress && (
        <div className="text-xs text-gray-500 space-y-0.5">
          <p className="font-medium text-gray-700">{so.shippingAddress.name}</p>
          <p>{so.shippingAddress.address1}{so.shippingAddress.address2 ? `, ${so.shippingAddress.address2}` : ''}</p>
          <p>{so.shippingAddress.city}, {so.shippingAddress.province} {so.shippingAddress.zip}</p>
          <p>{so.shippingAddress.country}{so.shippingAddress.phone ? ` · ${so.shippingAddress.phone}` : ''}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400">Sent {new Date(so.sentAt).toLocaleDateString('en-CA')}</p>
        {so.trackingNumber
          ? <span className="text-xs text-green-700 font-medium">{so.trackingCompany}: {so.trackingNumber}</span>
          : so.status !== 'shipped' && (
            <button onClick={() => setShowTracking(v => !v)} className="text-xs text-nb-blue hover:underline">
              Add tracking
            </button>
          )
        }
      </div>

      {showTracking && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <input
              value={tracking.company}
              onChange={e => setTracking(p => ({ ...p, company: e.target.value }))}
              placeholder="Carrier (e.g. Canada Post)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-nb-blue"
            />
            <input
              value={tracking.number}
              onChange={e => setTracking(p => ({ ...p, number: e.target.value }))}
              placeholder="Tracking number"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-nb-blue"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !tracking.number}
            className="bg-nb-navy text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-nb-blue transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Tracking'}
          </button>
        </div>
      )}
    </div>
  )
}

function ForwardPanel({ order, existingSupplierOrders, onForwarded }) {
  const [forwarding, setForwarding] = useState({})

  // Group line items by supplier, exclude items already forwarded in a supplier order
  const alreadyForwarded = new Set(existingSupplierOrders.map(so => so.supplierId))
  const bySupplier = {}
  for (const item of order.lineItems ?? []) {
    if (!item.supplier) continue
    const { id, name } = item.supplier
    if (!bySupplier[id]) bySupplier[id] = { id, name, items: [] }
    bySupplier[id].items.push(item)
  }
  const pending = Object.values(bySupplier).filter(s => !alreadyForwarded.has(s.id))

  if (!pending.length) return null

  const handleForward = async (supplier) => {
    setForwarding(p => ({ ...p, [supplier.id]: true }))
    try {
      const res = await fetch('/api/admin/supplier-orders.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderName: order.name,
          supplierId: supplier.id,
          supplierName: supplier.name,
          items: supplier.items.map(i => ({ title: i.title, variantTitle: i.variantTitle, quantity: i.quantity, price: i.price })),
          shippingAddress: order.shippingAddress,
        }),
      })
      const data = await res.json()
      toast.success(`Forwarded to ${supplier.name} — ref ${data.supplierOrder?.reference}`)
      onForwarded()
    } catch {
      toast.error('Failed to forward order')
    } finally {
      setForwarding(p => ({ ...p, [supplier.id]: false }))
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Ready to forward</p>
      {pending.map(supplier => (
        <div key={supplier.id} className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-nb-navy">{supplier.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{supplier.items.length} item{supplier.items.length > 1 ? 's' : ''} to forward</p>
            </div>
            <button
              onClick={() => handleForward(supplier)}
              disabled={forwarding[supplier.id]}
              className="bg-nb-navy text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-nb-blue transition-colors disabled:opacity-60 shrink-0"
            >
              {forwarding[supplier.id] ? 'Sending…' : 'Forward to Supplier'}
            </button>
          </div>
          <div className="space-y-1">
            {supplier.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.title} <span className="text-gray-400">× {item.quantity}</span> <span className="text-gray-400 text-xs">({item.variantTitle})</span></span>
                <span className="text-nb-navy font-medium shrink-0">{formatCurrency(item.price, order.currencyCode)}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p className="font-medium text-gray-600">{order.shippingAddress?.name ?? order.customerName}</p>
            {order.shippingAddress?.address1 && <p>{order.shippingAddress.address1}{order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.zip}</p>
            <p>{order.shippingAddress?.country}{order.shippingAddress?.phone ? ` · ${order.shippingAddress.phone}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [supplierOrders, setSupplierOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fulfilling, setFulfilling] = useState(false)

  const loadData = () => {
    Promise.all([
      fetch(`/api/admin/orders/${id}.json`).then(r => r.json()),
      fetch(`/api/admin/orders/${id}/supplier-orders.json`).then(r => r.json()),
    ]).then(([orderData, soData]) => {
      setOrder(orderData.order)
      setSupplierOrders(soData.supplierOrders ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { loadData() }, [id])

  const handleFulfill = async () => {
    setFulfilling(true)
    try {
      await fetch(`/api/admin/orders/${id}/fulfillments.json`, { method: 'POST' })
      setOrder(prev => ({
        ...prev,
        fulfillmentStatus: 'fulfilled',
        timeline: [...(prev.timeline ?? []), { at: new Date().toISOString(), message: 'Order fulfilled and shipped' }],
      }))
      toast.success('Order marked as fulfilled.')
    } catch {
      toast.error('Failed to fulfill order.')
    } finally {
      setFulfilling(false)
    }
  }

  const handleTrackingUpdate = (soId, trackingNumber, trackingCompany) => {
    setSupplierOrders(prev => prev.map(so =>
      so.id === soId ? { ...so, trackingNumber, trackingCompany, status: 'shipped' } : so
    ))
  }

  if (loading) return (
    <>
      <AdminHeader title="Order" />
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (!order) return (
    <>
      <AdminHeader title="Order not found" />
      <div className="p-6"><Link href="/admin/orders" className="text-nb-blue text-sm">← Back to orders</Link></div>
    </>
  )

  return (
    <>
      <AdminHeader title={order.name} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Link href="/admin/orders" className="text-xs text-gray-400 hover:text-nb-blue transition-colors">← Orders</Link>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Order summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-nb-navy text-sm">Order Summary</h2>
            <div className="flex gap-2">
              <StatusBadge status={order.fulfillmentStatus} />
              <StatusBadge status={order.financialStatus} />
            </div>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })}</p>
            <div className="border-t border-gray-50 pt-3 space-y-2">
              {order.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm gap-2">
                  <div>
                    <span className="text-gray-700">{item.title}</span>
                    <span className="text-gray-400"> × {item.quantity}</span>
                    <span className="text-gray-400 text-xs"> ({item.variantTitle})</span>
                    {item.supplier && (
                      <Link href={`/admin/suppliers/${item.supplier.id}`}
                        className="ml-2 text-xs bg-nb-sky/20 text-nb-blue px-2 py-0.5 rounded-full hover:bg-nb-sky/40 transition-colors">
                        {item.supplier.name}
                      </Link>
                    )}
                  </div>
                  <span className="font-medium text-nb-navy shrink-0">{formatCurrency(item.price, order.currencyCode)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-nb-navy border-t border-gray-50 pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.totalPrice, order.currencyCode)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-nb-navy text-sm">Customer</h2>
            <p className="text-sm font-medium text-nb-navy">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.customerEmail}</p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress.city}, {order.shippingAddress.province}, {order.shippingAddress.country}
            </p>
            <Link href={`/admin/customers/${order.customerId}`} className="text-xs text-nb-blue hover:underline">
              View customer →
            </Link>
          </div>
        </div>

        {/* Fulfill action */}
        {order.fulfillmentStatus === 'unfulfilled' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800 font-medium">This order is awaiting fulfillment.</p>
            <button
              onClick={handleFulfill}
              disabled={fulfilling}
              className="bg-nb-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-nb-blue transition-colors disabled:opacity-60"
            >
              {fulfilling ? 'Fulfilling…' : 'Mark Fulfilled'}
            </button>
          </div>
        )}

        {/* Supplier Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-nb-navy text-sm">Supplier Orders</h2>

          {supplierOrders.length > 0 && (
            <div className="space-y-3">
              {supplierOrders.map(so => (
                <SupplierOrderCard key={so.id} so={so} onTrackingUpdate={handleTrackingUpdate} />
              ))}
            </div>
          )}

          <ForwardPanel
            order={order}
            existingSupplierOrders={supplierOrders}
            onForwarded={loadData}
          />

          {supplierOrders.length === 0 && (order.lineItems ?? []).every(i => !i.supplier) && (
            <p className="text-sm text-gray-400">No supplier assignments on this order.</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-nb-navy text-sm mb-4">Timeline</h2>
          <OrderTimeline timeline={order.timeline} />
        </div>
      </div>
    </>
  )
}
