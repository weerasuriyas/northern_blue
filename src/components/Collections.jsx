import { useRef } from 'react'
import ButterflyLogo from './ButterflyLogo'
import useFadeIn from '../hooks/useFadeIn'

const COLLECTIONS = [
  {
    id: 'spring',
    title: 'Spring Collection',
    type: 'Seasonal',
    tagline: 'Fresh florals, soft palettes — yours to wear.',
  },
  {
    id: 'essentials',
    title: 'Everyday Essentials',
    type: 'Style',
    tagline: 'The pieces you reach for first, every morning.',
  },
  {
    id: 'workwear',
    title: 'Workwear Edit',
    type: 'Style',
    tagline: 'Polished. Powerful. Perfectly you.',
  },
  {
    id: 'casual',
    title: 'Weekend Casual',
    type: 'Style',
    tagline: 'Easy fits for the days that belong to you.',
  },
]

const Collections = () => {
  const headingRef = useRef(null)
  const gridRef = useRef(null)
  useFadeIn(headingRef)
  useFadeIn(gridRef)

  return (
    <section id="collections" className="bg-white py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className="fade-in flex items-center gap-3 mb-12">
          <ButterflyLogo size={28} />
          <h2 className="font-serif text-3xl md:text-4xl text-nb-navy">Our Collections</h2>
        </div>
        <div ref={gridRef} className="fade-in delay-1 grid md:grid-cols-2 gap-6">
          {COLLECTIONS.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden border border-nb-sky/40 bg-white hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="aspect-[4/3] bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm tracking-wide">
                image placeholder
              </div>
              <div className="p-5 md:p-6">
                <span className="text-xs uppercase tracking-widest text-nb-blue/60 font-medium">
                  {c.type}
                </span>
                <h3 className="font-serif text-xl md:text-2xl text-nb-navy mt-1 mb-2">{c.title}</h3>
                <p className="text-nb-navy/60 text-sm leading-relaxed mb-5">{c.tagline}</p>
                <button
                  type="button"
                  className="border border-nb-blue text-nb-blue text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-nb-blue hover:text-white transition-colors"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Collections
