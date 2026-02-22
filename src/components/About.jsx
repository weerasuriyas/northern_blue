import { useRef } from 'react'
import useFadeIn from '../hooks/useFadeIn'

const About = () => {
  const imgRef = useRef(null)
  const textRef = useRef(null)
  useFadeIn(imgRef)
  useFadeIn(textRef)

  return (
    <section id="about" className="bg-nb-cream py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div ref={imgRef} className="fade-in flex justify-center md:justify-start">
            <div className="w-full max-w-xs h-64 md:h-96 rounded-2xl bg-nb-sky/30 border-2 border-nb-sky/50 flex items-center justify-center text-nb-blue/40 text-sm">
              Founder photo
            </div>
          </div>
          <div ref={textRef} className="fade-in delay-1">
            <h2 className="font-serif text-3xl md:text-4xl text-nb-navy mb-6">Our Story</h2>
            <div className="space-y-4 text-nb-navy/70 leading-relaxed">
              <p>
                We strive to offer well made clothes that fit plus size bodies well.
              </p>
              <p>
                We believe in sourcing well made clothes from manufacturers that adhere
                to high labour standards &amp; eco friendly products.
              </p>
            </div>
            <blockquote className="mt-8 pl-5 border-l-4 border-nb-blue">
              <p className="font-serif text-lg md:text-xl italic text-nb-blue leading-snug">
                "Love your clothes, love our earth."
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
