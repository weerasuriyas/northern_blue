'use client'

import { useRouter } from 'next/navigation'

export default function AdminHeader({ title }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <h1 className="font-serif text-xl text-nb-navy">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Log out
      </button>
    </header>
  )
}
