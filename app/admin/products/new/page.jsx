'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import toast from 'react-hot-toast'

const SIZES = ['1X', '2X', '3X', '4X']

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', price: '', sizes: ['1X', '2X', '3X', '4X'] })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/admin/products.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: form }),
      })
      toast.success('Product created!')
      router.push('/admin/products')
    } catch {
      toast.error('Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSize = (size) => {
    setForm(p => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size],
    }))
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-nb-navy focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

  return (
    <>
      <AdminHeader title="New Product" />
      <div className="p-6 max-w-xl">
        <Link href="/admin/products" className="text-xs text-gray-400 hover:text-nb-blue transition-colors mb-6 inline-block">← Products</Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Title</label>
            <input required className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Floral Wrap Dress" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Description</label>
            <textarea rows={4} className={inputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Price (CAD)</label>
            <input required type="number" step="0.01" min="0" className={inputClass} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="79.99" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-2">Sizes</label>
            <div className="flex gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.sizes.includes(size)
                      ? 'border-nb-blue bg-nb-blue text-white'
                      : 'border-gray-200 text-gray-500 hover:border-nb-blue hover:text-nb-blue'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-nb-navy text-white font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Product'}
            </button>
            <Link href="/admin/products" className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-300 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
