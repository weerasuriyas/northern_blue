'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatusBadge from '@/admin/components/StatusBadge'
import OrderTimeline from '@/admin/components/OrderTimeline'
import { formatCurrency } from '@/lib/formatCurrency'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fulfilling, setFulfilling] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}.json`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setLoading(false) })
  }, [id])

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
            <div className="border-t border-gray-50 pt-3 space-y-1.5">
              {order.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.title} <span className="text-gray-400">× {item.quantity}</span> <span className="text-gray-400 text-xs">({item.variantTitle})</span></span>
                  <span className="font-medium text-nb-navy">{formatCurrency(item.price, order.currencyCode)}</span>
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

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-nb-navy text-sm mb-4">Timeline</h2>
          <OrderTimeline timeline={order.timeline} />
        </div>
      </div>
    </>
  )
}
