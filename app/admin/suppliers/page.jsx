'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'

const INTEGRATION_BADGE = {
  manual:             'bg-gray-100 text-gray-600 border-gray-200',
  email:              'bg-blue-50 text-blue-700 border-blue-200',
  api:                'bg-green-50 text-green-700 border-green-200',
  shopify_collective: 'bg-purple-50 text-purple-700 border-purple-200',
}

function IntegrationBadge({ type }) {
  const style = INTEGRATION_BADGE[type] ?? INTEGRATION_BADGE.manual
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {type?.replace('_', ' ')}
    </span>
  )
}

function ActiveBadge({ active }) {
  return active
    ? <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">Active</span>
    : <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">Inactive</span>
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/suppliers.json')
      .then(r => r.json())
      .then(d => { setSuppliers(d.suppliers ?? []); setLoading(false) })
  }, [])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: s => (
        <Link href={`/admin/suppliers/${s.id}`} className="font-medium text-nb-blue hover:underline">
          {s.name}
        </Link>
      ),
    },
    { key: 'contactEmail', header: 'Contact Email', render: s => <span className="text-gray-500">{s.contactEmail}</span> },
    { key: 'country', header: 'Country' },
    { key: 'integrationType', header: 'Integration', render: s => <IntegrationBadge type={s.integrationType} /> },
    { key: 'leadTimeDays', header: 'Lead Time', render: s => `${s.leadTimeDays}d` },
    { key: 'active', header: 'Status', render: s => <ActiveBadge active={s.active} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: s => (
        <Link href={`/admin/suppliers/${s.id}`} className="text-xs text-nb-blue hover:underline">
          View
        </Link>
      ),
    },
  ]

  return (
    <>
      <AdminHeader title="Suppliers" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="search"
            placeholder="Search suppliers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition"
          />
          <Link
            href="/admin/suppliers/new"
            className="bg-nb-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-nb-blue transition-colors whitespace-nowrap"
          >
            Add Supplier
          </Link>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No suppliers found." />
      </div>
    </>
  )
}
