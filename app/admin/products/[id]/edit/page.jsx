'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'
import toast from 'react-hot-toast'

const SIZES = ['1X', '2X', '3X', '4X']

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/products/${id}.json`)
      .then(r => r.json())
      .then(d => {
        const p = d.product
        setForm({
          title: p.title,
          description: p.description ?? '',
          price: p.priceRange.minVariantPrice.amount,
          sizes: p.variants?.edges?.map(e => e.node.title) ?? SIZES,
        })
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch(`/api/admin/products/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: form }),
      })
      toast.success('Product updated!')
      router.push('/admin/products')
    } catch {
      toast.error('Failed to update product.')
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

  if (loading) return (
    <>
      <AdminHeader title="Edit Product" />
      <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-nb-blue border-t-transparent rounded-full animate-spin" /></div>
    </>
  )

  return (
    <>
      <AdminHeader title="Edit Product" />
      <div className="p-6 max-w-xl">
        <Link href="/admin/products" className="text-xs text-gray-400 hover:text-nb-blue transition-colors mb-6 inline-block">← Products</Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Title</label>
            <input required className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Description</label>
            <textarea rows={4} className={inputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-1.5">Price (CAD)</label>
            <input required type="number" step="0.01" min="0" className={inputClass} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-nb-navy mb-2">Sizes</label>
            <div className="flex gap-2">
              {SIZES.map(size => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.sizes.includes(size) ? 'border-nb-blue bg-nb-blue text-white' : 'border-gray-200 text-gray-500 hover:border-nb-blue hover:text-nb-blue'
                  }`}>{size}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-nb-navy text-white font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link href="/admin/products" className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-300 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
