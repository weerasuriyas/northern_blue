'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'
import { formatCurrency } from '@/lib/formatCurrency'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/products.json')
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false) })
  }, [])

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'title', header: 'Product', render: p => (
      <span className="font-medium text-nb-navy">{p.title}</span>
    )},
    { key: 'price', header: 'Price', render: p => formatCurrency(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode) },
    { key: 'variants', header: 'Sizes', render: p => p.variants?.edges?.map(e => e.node.title).join(', ') },
    { key: 'actions', header: '', render: p => (
      <Link href={`/admin/products/${p.id}/edit`} className="text-nb-blue text-xs hover:underline">Edit</Link>
    )},
  ]

  return (
    <>
      <AdminHeader title="Products" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition"
          />
          <Link
            href="/admin/products/new"
            className="bg-nb-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-nb-blue transition-colors whitespace-nowrap"
          >
            + New Product
          </Link>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No products found." />
      </div>
    </>
  )
}
