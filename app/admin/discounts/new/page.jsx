'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import toast from 'react-hot-toast'

export default function NewDiscountPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    usageLimit: '',
    expiresAt: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/admin/discounts.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount: form }),
      })
      toast.success('Discount created!')
      router.push('/admin/discounts')
    } catch {
      toast.error('Failed to create discount.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-nb-navy focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

  const valueLabel = form.type === 'percentage' ? '% off' : '$ off'

  return (
    <>
      <AdminHeader title="New Discount" />
      <div className="p-6 max-w-xl">
        <Link href="/admin/discounts" className="text-xs text-gray-400 hover:text-nb-blue transition-colors mb-6 inline-block">
          ← Discounts
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">

          {/* Discount Code */}
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">
              Discount Code <span className="text-red-500">*</span>
            </label>
            <input
              required
              className={`${inputClass} font-mono tracking-wide uppercase`}
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER25"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Type</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={e => set('type', e.target.value)}
            >
              <option value="percentage">Percentage Off</option>
              <option value="fixed_amount">Fixed Amount Off</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>

          {/* Value — hidden for free_shipping */}
          {form.type !== 'free_shipping' && (
            <div>
              <label className="block text-sm font-medium text-nb-navy mb-1.5">
                Value ({valueLabel})
              </label>
              <input
                required
                type="number"
                min="0"
                step={form.type === 'percentage' ? '1' : '0.01'}
                className={inputClass}
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percentage' ? '15' : '10.00'}
              />
            </div>
          )}

          {/* Minimum Order Amount */}
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Minimum Order Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.minOrderAmount}
              onChange={e => set('minOrderAmount', e.target.value)}
              placeholder="0 = no minimum"
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Usage Limit</label>
            <input
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={form.usageLimit}
              onChange={e => set('usageLimit', e.target.value)}
              placeholder="Leave blank for unlimited"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Expiry Date</label>
            <input
              type="date"
              className={inputClass}
              value={form.expiresAt}
              onChange={e => set('expiresAt', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-nb-navy text-white font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Discount'}
            </button>
            <Link
              href="/admin/discounts"
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
