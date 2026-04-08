'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatusBadge from '@/admin/components/StatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/customers/${id}.json`)
      .then(r => r.json())
      .then(d => { setCustomer(d.customer); setOrders(d.orders ?? []); setLoading(false) })
  }, [id])

  if (loading) return (
    <>
      <AdminHeader title="Customer" />
      <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" /></div>
    </>
  )

  if (!customer) return (
    <>
      <AdminHeader title="Customer not found" />
      <div className="p-6"><Link href="/admin/customers" className="text-nb-blue text-sm">← Back</Link></div>
    </>
  )

  return (
    <>
      <AdminHeader title={`${customer.firstName} ${customer.lastName}`} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Link href="/admin/customers" className="text-xs text-gray-400 hover:text-nb-blue transition-colors">← Customers</Link>

        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-nb-navy">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
            <p className="text-sm text-nb-navy">{customer.city}, {customer.province}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Spent</p>
            <p className="text-sm font-semibold text-nb-navy">{formatCurrency(customer.totalSpent)}</p>
          </div>
        </div>

        {/* Order history */}
        <div>
          <h2 className="font-semibold text-nb-navy mb-3">Order History ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-nb-blue hover:underline text-sm">
                      {order.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-CA')} · {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.fulfillmentStatus} />
                    <span className="font-semibold text-nb-navy text-sm">{formatCurrency(order.totalPrice, order.currencyCode)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
