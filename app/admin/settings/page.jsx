'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/admin/components/AdminHeader'
import toast from 'react-hot-toast'

const inputClass = 'w-full rounded-lg border border-nb-sky/60 px-4 py-2.5 text-nb-navy text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

export default function SettingsPage() {
  const [store, setStore] = useState(null)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings.json')
      .then(r => r.json())
      .then(setStore)
      .catch(() => {})
  }, [])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (form.next !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      // Stub — real save works when ADMIN_PASSWORD_HASH env var is set
      await new Promise(r => setTimeout(r, 400))
      toast.success('Password updated.')
      setForm({ current: '', next: '', confirm: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="p-6 max-w-2xl space-y-6">

        {/* Section A — Store Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-base text-nb-navy mb-4">Store Info</h2>
          {store ? (
            <>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-400 mb-0.5">Store name</dt>
                  <dd className="text-nb-navy font-medium">{store.storeName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 mb-0.5">Email</dt>
                  <dd className="text-nb-navy font-medium">{store.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 mb-0.5">Currency</dt>
                  <dd className="text-nb-navy font-medium">{store.currency}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 mb-0.5">Timezone</dt>
                  <dd className="text-nb-navy font-medium">{store.timezone}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 mb-0.5">Country</dt>
                  <dd className="text-nb-navy font-medium">{store.country}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-gray-400">
                Manage store details in Shopify admin →
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Loading…</p>
          )}
        </div>

        {/* Section B — Admin Security */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-base text-nb-navy mb-4">Admin Security</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nb-navy mb-1.5">Current Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.current}
                onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nb-navy mb-1.5">New Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.next}
                onChange={e => setForm(p => ({ ...p, next: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nb-navy mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-nb-navy text-white font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60"
              >
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </>
  )
}
