'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatusBadge from '@/admin/components/StatusBadge'
import OrderTimeline from '@/admin/components/OrderTimeline'
import { formatCurrency } from '@/lib/formatCurrency'
import toast from 'react-hot-toast'

export default function ReturnDetailPage() {
  const { id } = useParams()
  const [ret, setRet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/returns/${id}.json`)
      .then(r => r.json())
      .then(d => { setRet(d.return); setLoading(false) })
  }, [id])

  const handleAction = async (action) => {
    setActing(true)
    try {
      await fetch(`/api/admin/returns/${id}/${action}.json`, { method: 'POST' })

      const now = new Date().toISOString()
      const messages = {
        approve: 'Return approved by admin',
        decline: 'Return declined by admin',
        refund: `Refund of $${ret.refundAmount} ${ret.currencyCode} issued`,
      }
      const statuses = {
        approve: 'approved',
        decline: 'declined',
        refund: 'refunded',
      }
      const toasts = {
        approve: 'Return approved.',
        decline: 'Return declined.',
        refund: 'Refund issued.',
      }

      setRet(prev => ({
        ...prev,
        status: statuses[action],
        timeline: [...(prev.timeline ?? []), { at: now, message: messages[action] }],
      }))
      toast.success(toasts[action])
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  if (loading) return (
    <>
      <AdminHeader title="Return" />
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (!ret) return (
    <>
      <AdminHeader title="Return not found" />
      <div className="p-6">
        <Link href="/admin/returns" className="text-nb-blue text-sm">← Back to returns</Link>
      </div>
    </>
  )

  return (
    <>
      <AdminHeader title={`Return ${ret.orderName}`} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Link href="/admin/returns" className="text-xs text-gray-400 hover:text-nb-blue transition-colors">
          ← Returns
        </Link>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Return Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-nb-navy text-sm">Return Details</h2>
            <StatusBadge status={ret.status} />
            <p className="text-xs text-gray-400">
              Requested{' '}
              {new Date(ret.requestedAt).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-gray-700">{ret.reason}</p>
            </div>
            <div className="border-t border-gray-50 pt-3 space-y-1.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Items</p>
              {ret.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.title}{' '}
                    <span className="text-gray-400">× {item.quantity}</span>{' '}
                    <span className="text-gray-400 text-xs">({item.variantTitle})</span>
                  </span>
                  <span className="font-medium text-nb-navy">
                    {formatCurrency(item.price, ret.currencyCode)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-nb-navy border-t border-gray-50 pt-2">
                <span>Refund Total</span>
                <span>{formatCurrency(ret.refundAmount, ret.currencyCode)}</span>
              </div>
            </div>
            {ret.notes ? (
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-600">{ret.notes}</p>
              </div>
            ) : null}
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-nb-navy text-sm">Customer</h2>
            <p className="text-sm font-medium text-nb-navy">{ret.customerName}</p>
            <p className="text-sm text-gray-500">{ret.customerEmail}</p>
            <Link
              href={`/admin/customers/${ret.customerId}`}
              className="block text-xs text-nb-blue hover:underline"
            >
              View customer →
            </Link>
            <Link
              href={`/admin/orders/${ret.orderId}`}
              className="block text-xs text-nb-blue hover:underline"
            >
              View original order {ret.orderName} →
            </Link>
          </div>
        </div>

        {/* Action bar */}
        {ret.status === 'requested' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-blue-800 font-medium">This return is awaiting review.</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={acting}
                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {acting ? 'Saving…' : 'Approve Return'}
              </button>
              <button
                onClick={() => handleAction('decline')}
                disabled={acting}
                className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {acting ? 'Saving…' : 'Decline Return'}
              </button>
            </div>
          </div>
        )}

        {ret.status === 'approved' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800 font-medium">Return approved — ready to issue refund.</p>
            <button
              onClick={() => handleAction('refund')}
              disabled={acting}
              className="bg-nb-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-nb-blue transition-colors disabled:opacity-60"
            >
              {acting ? 'Processing…' : `Mark Refunded (${formatCurrency(ret.refundAmount, ret.currencyCode)})`}
            </button>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-nb-navy text-sm mb-4">Timeline</h2>
          <OrderTimeline timeline={ret.timeline} />
        </div>
      </div>
    </>
  )
}
