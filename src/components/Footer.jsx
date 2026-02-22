import ButterflyLogo from './ButterflyLogo'

const Footer = () => (
  <footer className="bg-nb-navy py-10 px-6">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
      <ButterflyLogo size={32} />
      <p className="font-serif text-white/80 tracking-widest text-sm">
        Northern Blue
      </p>
      <p className="text-white/40 text-xs">
        &copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </p>
    </div>
  </footer>
)

export default Footer
