'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'
import StatusBadge from '@/admin/components/StatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'

const STATUSES = ['all', 'requested', 'approved', 'declined', 'refunded']

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/returns.json')
      .then(r => r.json())
      .then(d => { setReturns(d.returns ?? []); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? returns : returns.filter(r => r.status === filter)

  const columns = [
    {
      key: 'id',
      header: 'Return ID',
      render: r => (
        <Link href={`/admin/returns/${r.id}`} className="font-medium text-nb-blue hover:underline">
          {r.id}
        </Link>
      ),
    },
    {
      key: 'orderName',
      header: 'Order',
      render: r => (
        <Link href={`/admin/orders/${r.orderId}`} className="text-nb-blue hover:underline">
          {r.orderName}
        </Link>
      ),
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'items',
      header: 'Item(s)',
      render: r => {
        const first = r.items[0]
        const extra = r.items.length - 1
        return (
          <span>
            {first.title}
            {extra > 0 && <span className="text-gray-400 ml-1">+ {extra} more</span>}
          </span>
        )
      },
    },
    {
      key: 'refundAmount',
      header: 'Refund Amount',
      render: r => formatCurrency(r.refundAmount, r.currencyCode),
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: r => new Date(r.requestedAt).toLocaleDateString('en-CA'),
    },
    {
      key: 'status',
      header: 'Status',
      render: r => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <>
      <AdminHeader title="Returns" />
      <div className="p-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-nb-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-nb-blue hover:text-nb-blue'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No returns found." />
      </div>
    </>
  )
}
