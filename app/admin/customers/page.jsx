'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'
import { formatCurrency } from '@/lib/formatCurrency'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers.json')
      .then(r => r.json())
      .then(d => { setCustomers(d.customers ?? []); setLoading(false) })
  }, [])

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name', header: 'Customer', render: c => (
      <Link href={`/admin/customers/${c.id}`} className="font-medium text-nb-blue hover:underline">
        {c.firstName} {c.lastName}
      </Link>
    )},
    { key: 'email', header: 'Email', render: c => <span className="text-gray-500">{c.email}</span> },
    { key: 'location', header: 'Location', render: c => `${c.city}, ${c.province}` },
    { key: 'ordersCount', header: 'Orders' },
    { key: 'totalSpent', header: 'Total Spent', render: c => formatCurrency(c.totalSpent) },
  ]

  return (
    <>
      <AdminHeader title="Customers" />
      <div className="p-6 space-y-4">
        <input
          type="search"
          placeholder="Search customers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition"
        />
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No customers found." />
      </div>
    </>
  )
}
