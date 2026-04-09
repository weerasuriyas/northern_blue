'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatsCard from '@/admin/components/StatsCard'
import DataTable from '@/admin/components/DataTable'
import StatusBadge from '@/admin/components/StatusBadge'
import LowStockAlert from '@/admin/components/LowStockAlert'
import RevenueChart from '@/admin/components/RevenueChart'
import { formatCurrency } from '@/lib/formatCurrency'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()),
      fetch('/api/admin/orders.json').then(r => r.json()),
      fetch('/api/admin/inventory/levels.json').then(r => r.json()),
      fetch('/api/admin/revenue.json').then(r => r.json()),
    ]).then(([s, o, inv, rev]) => {
      setStats(s)
      setOrders(o.orders?.slice(0, 5) ?? [])
      setInventory(inv.inventory ?? [])
      setRevenue(rev.revenue ?? [])
      setLoading(false)
    })
  }, [])

  const orderColumns = [
    { key: 'name', header: 'Order' },
    { key: 'customerName', header: 'Customer' },
    { key: 'totalPrice', header: 'Total', render: r => formatCurrency(r.totalPrice, r.currencyCode) },
    { key: 'fulfillmentStatus', header: 'Fulfillment', render: r => <StatusBadge status={r.fulfillmentStatus} /> },
    { key: 'actions', header: '', render: r => (
      <Link href={`/admin/orders/${r.id}`} className="text-nb-blue text-xs hover:underline">View</Link>
    )},
  ]

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Revenue (month)"
            value={stats ? formatCurrency(stats.revenueThisMonth, stats.currencyCode) : '—'}
          />
          <StatsCard title="Orders (month)" value={stats?.ordersThisMonth ?? '—'} />
          <StatsCard title="Customers" value={stats?.totalCustomers ?? '—'} />
          <StatsCard
            title="Avg Order Value"
            value={stats ? formatCurrency(stats.avgOrderValue, stats.currencyCode) : '—'}
          />
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-nb-navy mb-4">Revenue — Last 30 Days</h2>
          <RevenueChart data={revenue} />
        </div>

        {/* Low stock */}
        <LowStockAlert inventory={inventory} />

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-nb-navy">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-nb-blue hover:underline">View all</Link>
          </div>
          <DataTable columns={orderColumns} data={orders} loading={loading} emptyMessage="No orders yet." />
        </div>
      </div>
    </>
  )
}
