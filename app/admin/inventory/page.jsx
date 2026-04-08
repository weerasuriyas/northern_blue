'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/admin/components/AdminHeader'
import DataTable from '@/admin/components/DataTable'

const LOW = 4

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/inventory/levels.json')
      .then(r => r.json())
      .then(d => { setInventory(d.inventory ?? []); setLoading(false) })
  }, [])

  const columns = [
    { key: 'productTitle', header: 'Product' },
    { key: 'variantTitle', header: 'Size' },
    {
      key: 'available', header: 'In Stock',
      render: row => (
        <span className={`font-semibold ${row.available === 0 ? 'text-red-600' : row.available <= LOW ? 'text-amber-600' : 'text-green-700'}`}>
          {row.available === 0 ? 'Out of stock' : row.available}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: row => row.available === 0
        ? <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Out of stock</span>
        : row.available <= LOW
        ? <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Low stock</span>
        : <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">OK</span>,
    },
  ]

  const lowCount = inventory.filter(i => i.available <= LOW).length

  return (
    <>
      <AdminHeader title="Inventory" />
      <div className="p-6 space-y-4">
        {lowCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            {lowCount} variant{lowCount !== 1 ? 's' : ''} at low stock or out of stock.
          </div>
        )}
        <DataTable columns={columns} data={inventory} loading={loading} emptyMessage="No inventory data." />
      </div>
    </>
  )
}
