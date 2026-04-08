'use client'

import Link from 'next/link'
import ButterflyLogo from './ButterflyLogo'

const Footer = () => (
  <footer className="bg-nb-navy py-10 px-6">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">
      <ButterflyLogo size={32} />
      <p className="font-serif text-white/80 tracking-widest text-sm">
        Northern Blue
      </p>
      <nav aria-label="footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/50">
        <Link href="/collections" className="hover:text-white/80 transition-colors">Shop</Link>
        <Link href="/collections/spring-collection" className="hover:text-white/80 transition-colors">Spring Collection</Link>
        <Link href="/size-guide" className="hover:text-white/80 transition-colors">Size Guide</Link>
        <Link href="/#about" className="hover:text-white/80 transition-colors">About</Link>
        <Link href="/#contact" className="hover:text-white/80 transition-colors">Contact</Link>
      </nav>
      <p className="text-white/40 text-xs">
        &copy; {new Date().getFullYear()} Northern Blue. All rights reserved.
      </p>
    </div>
  </footer>
)

export default Footer
