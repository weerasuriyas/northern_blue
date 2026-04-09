'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import toast from 'react-hot-toast'

const INTEGRATION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'email', label: 'Email' },
  { value: 'api', label: 'API' },
  { value: 'shopify_collective', label: 'Shopify Collective' },
]

const EMPTY_FORM = {
  name: '',
  contactName: '',
  contactEmail: '',
  phone: '',
  country: '',
  leadTimeDays: '',
  integrationType: 'manual',
  notes: '',
}

export default function NewSupplierPage() {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/admin/suppliers.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier: form }),
      })
      toast.success('Supplier created!')
      router.push('/admin/suppliers')
    } catch {
      toast.error('Failed to create supplier.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-nb-navy focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

  return (
    <>
      <AdminHeader title="New Supplier" />
      <div className="p-6 max-w-xl">
        <Link href="/admin/suppliers" className="text-xs text-gray-400 hover:text-nb-blue transition-colors mb-6 inline-block">← Suppliers</Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Name <span className="text-red-500">*</span></label>
            <input required className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Maple Textiles Co." />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Contact Name</label>
            <input className={inputClass} value={form.contactName} onChange={set('contactName')} placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Contact Email <span className="text-red-500">*</span></label>
            <input required type="email" className={inputClass} value={form.contactEmail} onChange={set('contactEmail')} placeholder="orders@supplier.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Phone</label>
            <input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+1-416-555-0100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Country</label>
            <input className={inputClass} value={form.country} onChange={set('country')} placeholder="e.g. Canada" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Lead Time (days)</label>
            <input type="number" min="0" className={inputClass} value={form.leadTimeDays} onChange={set('leadTimeDays')} placeholder="5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Integration Type</label>
            <select className={inputClass} value={form.integrationType} onChange={set('integrationType')}>
              {INTEGRATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Notes</label>
            <textarea rows={3} className={inputClass} value={form.notes} onChange={set('notes')} placeholder="Any special instructions…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-nb-navy text-white font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Supplier'}
            </button>
            <Link href="/admin/suppliers" className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-300 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
