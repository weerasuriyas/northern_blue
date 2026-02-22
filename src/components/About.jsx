import { useRef } from 'react'
import useFadeIn from '../hooks/useFadeIn'

const About = () => {
  const imgRef = useRef(null)
  const textRef = useRef(null)
  useFadeIn(imgRef)
  useFadeIn(textRef)

  return (
    <section id="about" className="bg-nb-cream py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={imgRef} className="fade-in flex justify-center md:justify-start">
            <div className="w-72 h-96 rounded-2xl bg-nb-sky/30 border-2 border-nb-sky/50 flex items-center justify-center text-nb-blue/40 text-sm">
              Founder photo
            </div>
          </div>
          <div ref={textRef} className="fade-in delay-1">
            <h2 className="font-serif text-4xl text-nb-navy mb-6">Our Story</h2>
            <div className="space-y-4 text-nb-navy/70 leading-relaxed">
              <p>
                Northern Blue began with a simple belief: each woman deserves to feel beautiful,
                confident, and seen — no matter her size or shape. Born from the owner's own
                experience of searching endlessly for clothing that fit both her body and her spirit,
                Northern Blue is the store she always wished existed.
              </p>
              <p>
                Inspired by the delicate resilience of the Northern Blue butterfly — small, vibrant,
                and breathtakingly beautiful — this brand is built for women who refuse to shrink
                themselves to fit a mold. Our pieces are designed to move with you, celebrate you,
                and remind you that style has no size limit.
              </p>
              <p>
                We are a community before we are a store. Every collection is curated with care,
                every fabric chosen with your comfort in mind.
              </p>
            </div>
            <blockquote className="mt-8 pl-5 border-l-4 border-nb-blue">
              <p className="font-serif text-xl italic text-nb-blue leading-snug">
                "Every woman deserves to feel beautiful, exactly as she is."
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
