import ButterflyLogo from './ButterflyLogo'

const Hero = () => (
  <section
    id="hero"
    className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
    style={{
      background: 'radial-gradient(ellipse at 50% 40%, #B8D9F0 0%, #F8FAFD 65%)',
    }}
  >
    {/* Butterfly centerpiece */}
    <div className="mb-8 drop-shadow-lg">
      <ButterflyLogo size={160} flutter />
    </div>

    {/* Brand name */}
    <h1 className="font-serif text-5xl md:text-7xl text-nb-navy tracking-widest mb-4 text-center">
      Northern Blue
    </h1>

    {/* Tagline */}
    <p className="text-nb-navy/60 text-lg md:text-xl tracking-wide text-center max-w-md">
      Style for every body. Every season.
    </p>

    {/* Scroll indicator */}
    <a
      href="#about"
      aria-label="scroll down"
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-nb-blue/50 hover:text-nb-blue transition-colors animate-bounce"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </a>
  </section>
)

export default Hero
