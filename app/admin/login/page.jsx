'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ButterflyLogo from '@/components/ButterflyLogo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        setError('Invalid username or password.')
        return
      }
      router.push('/admin')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nb-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ButterflyLogo size={48} className="mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-nb-navy">Admin Login</h1>
          <p className="text-sm text-nb-navy/50 mt-1">Northern Blue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-nb-sky/40 p-6 space-y-4 shadow-sm">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-nb-navy mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              className="w-full rounded-lg border border-nb-sky/60 px-4 py-2.5 text-nb-navy text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-nb-navy mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full rounded-lg border border-nb-sky/60 px-4 py-2.5 text-nb-navy text-sm focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nb-navy text-white font-medium py-3 rounded-lg hover:bg-nb-blue transition-colors text-sm disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-nb-navy/30 mt-4">
          Test credentials: admin / admin123
        </p>
      </div>
    </div>
  )
}
