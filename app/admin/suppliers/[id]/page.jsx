'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import StatusBadge from '@/admin/components/StatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'
import toast from 'react-hot-toast'

const SO_STATUS_STYLES = {
  pending:   'bg-gray-100 text-gray-600 border-gray-200',
  sent:      'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped:   'bg-green-50 text-green-700 border-green-200',
}

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

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-nb-navy">{children}</div>
    </div>
  )
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const [supplier, setSupplier] = useState(null)
  const [supplierOrders, setSupplierOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/suppliers/${id}.json`).then(r => r.json()),
      fetch(`/api/admin/suppliers/${id}/supplier-orders.json`).then(r => r.json()),
    ]).then(([sd, sod]) => {
      setSupplier(sd.supplier)
      setActive(sd.supplier?.active ?? false)
      setSupplierOrders(sod.supplierOrders ?? [])
      setLoading(false)
    })
  }, [id])

  const handleToggleStatus = () => {
    setActive(prev => !prev)
    toast.success('Status updated')
  }

  if (loading) return (
    <>
      <AdminHeader title="Supplier" />
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (!supplier) return (
    <>
      <AdminHeader title="Supplier not found" />
      <div className="p-6"><Link href="/admin/suppliers" className="text-nb-blue text-sm">← Back</Link></div>
    </>
  )

  return (
    <>
      <AdminHeader title={supplier.name} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Link href="/admin/suppliers" className="text-xs text-gray-400 hover:text-nb-blue transition-colors">← Suppliers</Link>

        {/* Contact & details card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold text-nb-navy">{supplier.name}</h2>
            <div className="flex items-center gap-2">
              {active
                ? <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">Active</span>
                : <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">Inactive</span>
              }
              <button
                onClick={handleToggleStatus}
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-nb-blue hover:text-nb-blue transition-colors"
              >
                {active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Contact Name">{supplier.contactName || '—'}</Field>
            <Field label="Contact Email">
              <a href={`mailto:${supplier.contactEmail}`} className="text-nb-blue hover:underline">{supplier.contactEmail}</a>
            </Field>
            <Field label="Phone">{supplier.phone || '—'}</Field>
            <Field label="Country">{supplier.country || '—'}</Field>
            <Field label="Lead Time">{supplier.leadTimeDays} business days</Field>
            <Field label="Integration Type"><IntegrationBadge type={supplier.integrationType} /></Field>
          </div>

          {supplier.notes && (
            <Field label="Notes">
              <p className="text-sm text-gray-600 whitespace-pre-line">{supplier.notes}</p>
            </Field>
          )}
        </div>

        {/* API details (only if api integration) */}
        {supplier.integrationType === 'api' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-nb-navy text-sm">API Configuration</h3>
            <Field label="API Endpoint">
              <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 break-all">
                {supplier.apiEndpoint || '—'}
              </span>
            </Field>
            <Field label="API Key">
              <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                {supplier.apiKey ? '••••••••••••' : 'Not configured'}
              </span>
            </Field>
          </div>
        )}

        {/* Connected products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-nb-navy text-sm mb-2">Connected Products</h3>
          <p className="text-2xl font-bold text-nb-navy">{supplier.productCount}</p>
          <p className="text-xs text-gray-400 mt-1">Assign products via Shopify admin</p>
        </div>

        {/* Order history */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-nb-navy text-sm">Order History</h3>
          {supplierOrders.length === 0
            ? <p className="text-sm text-gray-400">No orders forwarded to this supplier yet.</p>
            : (
              <div className="divide-y divide-gray-50">
                {supplierOrders.map(so => (
                  <div key={so.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/orders/${so.orderId}`} className="text-sm font-medium text-nb-blue hover:underline">
                          {so.orderName}
                        </Link>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${SO_STATUS_STYLES[so.status] ?? SO_STATUS_STYLES.sent}`}>
                          {so.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-400">{so.reference}</p>
                      <p className="text-xs text-gray-500">
                        {so.items.map(i => `${i.title} × ${i.quantity}`).join(', ')}
                      </p>
                      {so.trackingNumber && (
                        <p className="text-xs text-green-700">{so.trackingCompany}: {so.trackingNumber}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{new Date(so.sentAt).toLocaleDateString('en-CA')}</p>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <div className="relative group">
            <button
              disabled
              className="bg-gray-100 text-gray-400 font-medium px-5 py-2.5 rounded-lg text-sm cursor-not-allowed"
            >
              Edit Supplier
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-nb-navy text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
