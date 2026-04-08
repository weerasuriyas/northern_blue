'use client'

import { useState } from 'react'
import Link from 'next/link'
import ButterflyLogo from './ButterflyLogo'
import useCart from '@/hooks/useCart'

const NAV_LINKS = [
  { label: 'About', href: '/#about' },
  { label: 'Collections', href: '/#collections' },
  { label: 'Contact', href: '/#contact' },
]

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount, openCart } = useCart()

  return (
    <header className="bg-nb-bg/90 backdrop-blur-sm border-b border-nb-sky/30">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Northern Blue — return to top" className="flex items-center gap-3 group">
          <span aria-hidden="true"><ButterflyLogo size={36} /></span>
          <span className="flex flex-col">
            <span className="font-serif text-xl text-nb-navy tracking-wide">
              Northern Blue
            </span>
            <span className="text-xs italic text-nb-navy/50 tracking-wide hidden md:block">
              Love your clothes, love our earth.
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-nb-navy/70 hover:text-nb-blue transition-colors font-medium text-sm tracking-wide uppercase"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/collections"
              className="text-nb-navy/70 hover:text-nb-blue transition-colors font-medium text-sm tracking-wide uppercase"
            >
              Shop
            </Link>
          </li>
        </ul>

        {/* Cart + mobile hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label={`open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            className="relative p-2 text-nb-navy/70 hover:text-nb-blue transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nb-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          <button
            aria-label="toggle menu"
            className="md:hidden flex flex-col gap-1.5 p-3"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            <span className="block w-6 h-0.5 bg-nb-navy" />
            <span className="block w-6 h-0.5 bg-nb-navy" />
            <span className="block w-4 h-0.5 bg-nb-navy" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div data-testid="mobile-menu" className="md:hidden border-t border-nb-sky/30 bg-nb-bg px-6 py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-nb-navy font-medium text-base"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/collections"
                className="text-nb-navy font-medium text-base"
                onClick={() => setMobileOpen(false)}
              >
                Shop
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar
