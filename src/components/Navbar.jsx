import { useState } from 'react'
import ButterflyLogo from './ButterflyLogo'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nb-bg/90 backdrop-blur-sm border-b border-nb-sky/30">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <ButterflyLogo size={36} />
          <span className="font-serif text-xl text-nb-navy tracking-wide">
            Northern Blue
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="text-nb-navy/70 hover:text-nb-blue transition-colors font-medium text-sm tracking-wide uppercase"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          aria-label="toggle menu"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="block w-6 h-0.5 bg-nb-navy" />
          <span className="block w-6 h-0.5 bg-nb-navy" />
          <span className="block w-4 h-0.5 bg-nb-navy" />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div data-testid="mobile-menu" className="md:hidden border-t border-nb-sky/30 bg-nb-bg px-6 py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-nb-navy font-medium text-base"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar
