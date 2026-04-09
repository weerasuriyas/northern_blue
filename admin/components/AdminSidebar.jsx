'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ButterflyLogo from '@/components/ButterflyLogo'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
  { label: 'Customers', href: '/admin/customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Suppliers', href: '/admin/suppliers', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <ButterflyLogo size={28} />
        <div>
          <p className="font-serif text-sm text-nb-navy font-semibold">Northern Blue</p>
          <p className="text-[10px] text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-nb-sky/20 text-nb-blue font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-nb-navy'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link href="/" className="text-xs text-gray-400 hover:text-nb-blue transition-colors">
          ← View store
        </Link>
      </div>
    </aside>
  )
}
