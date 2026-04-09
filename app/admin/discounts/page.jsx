'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'
import toast from 'react-hot-toast'

const FILTERS = ['all', 'active', 'inactive']

const TYPE_BADGE = {
  percentage:   'bg-blue-50 text-blue-700 border-blue-200',
  fixed_amount: 'bg-green-50 text-green-700 border-green-200',
  free_shipping: 'bg-purple-50 text-purple-700 border-purple-200',
}

const TYPE_LABEL = {
  percentage:   'Percentage',
  fixed_amount: 'Fixed Amount',
  free_shipping: 'Free Shipping',
}

function TypeBadge({ type }) {
  const style = TYPE_BADGE[type] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {TYPE_LABEL[type] ?? type}
    </span>
  )
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    fetch('/api/admin/discounts.json')
      .then(r => r.json())
      .then(d => { setDiscounts(d.discounts ?? []); setLoading(false) })
  }, [])

  const filtered = filter === 'all'
    ? discounts
    : filter === 'active'
      ? discounts.filter(d => d.active)
      : discounts.filter(d => !d.active)

  const handleToggle = async (discount) => {
    setToggling(discount.id)
    try {
      await fetch(`/api/admin/discounts/${discount.id}/toggle.json`, { method: 'PUT' })
      setDiscounts(prev => prev.map(d => d.id === discount.id ? { ...d, active: !d.active } : d))
      toast.success('Updated')
    } catch {
      toast.error('Failed to update')
    } finally {
      setToggling(null)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => toast.success(`Copied "${code}"`))
  }

  const today = new Date().toISOString().slice(0, 10)

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: r => (
        <button
          onClick={() => handleCopyCode(r.code)}
          title="Click to copy"
          className="font-mono font-bold text-nb-navy tracking-wide hover:text-nb-blue transition-colors"
        >
          {r.code}
        </button>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      render: r => <span className="text-gray-600">{r.summary}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: r => <TypeBadge type={r.type} />,
    },
    {
      key: 'usage',
      header: 'Usage',
      render: r => (
        <span className="text-gray-600 tabular-nums">
          {r.usageLimit ? `${r.usageCount} / ${r.usageLimit} uses` : `${r.usageCount} uses`}
        </span>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Expiry',
      render: r => {
        if (!r.expiresAt) return <span className="text-gray-400 text-xs">No expiry</span>
        const expired = r.expiresAt < today
        return (
          <span className={expired ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {r.expiresAt}
            {expired && <span className="ml-1 text-xs">(expired)</span>}
          </span>
        )
      },
    },
    {
      key: 'active',
      header: 'Status',
      render: r => (
        <button
          onClick={() => handleToggle(r)}
          disabled={toggling === r.id}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
            r.active
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {toggling === r.id ? '…' : r.active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: r => (
        <Link
          href={`/admin/discounts/${r.id}/edit`}
          className="text-xs text-nb-blue hover:underline"
        >
          Edit
        </Link>
      ),
    },
  ]

  return (
    <>
      <AdminHeader title="Discounts" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-nb-blue text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-nb-blue hover:text-nb-blue'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Link
            href="/admin/discounts/new"
            className="bg-nb-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-nb-blue transition-colors"
          >
            + New Discount
          </Link>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No discounts found." />
      </div>
    </>
  )
}
