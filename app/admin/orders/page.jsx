'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'
import StatusBadge from '@/admin/components/StatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'

const STATUSES = ['all', 'fulfilled', 'unfulfilled']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/orders.json')
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.fulfillmentStatus === filter)

  const columns = [
    { key: 'name', header: 'Order', render: r => (
      <Link href={`/admin/orders/${r.id}`} className="font-medium text-nb-blue hover:underline">{r.name}</Link>
    )},
    { key: 'createdAt', header: 'Date', render: r => new Date(r.createdAt).toLocaleDateString('en-CA') },
    { key: 'customerName', header: 'Customer' },
    { key: 'shippingAddress', header: 'Location', render: r => `${r.shippingAddress.city}, ${r.shippingAddress.province}` },
    { key: 'totalPrice', header: 'Total', render: r => formatCurrency(r.totalPrice, r.currencyCode) },
    { key: 'financialStatus', header: 'Payment', render: r => <StatusBadge status={r.financialStatus} /> },
    { key: 'fulfillmentStatus', header: 'Fulfillment', render: r => <StatusBadge status={r.fulfillmentStatus} /> },
  ]

  return (
    <>
      <AdminHeader title="Orders" />
      <div className="p-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s ? 'bg-nb-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nb-blue hover:text-nb-blue'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No orders found." />
      </div>
    </>
  )
}
