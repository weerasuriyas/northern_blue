import { useState } from 'react'
import ButterflyLogo from './ButterflyLogo'

const INPUT_CLASS =
  'w-full rounded-lg border border-nb-sky/60 bg-white px-4 py-3 text-nb-navy placeholder-nb-navy/30 focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    const mailto = `mailto:admin@northernblue.ca?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-white py-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <ButterflyLogo size={28} />
          <h2 className="font-serif text-4xl text-nb-navy">Get in Touch</h2>
        </div>
        {submitted ? (
          <div className="text-center py-16">
            <ButterflyLogo size={56} className="mx-auto mb-6" />
            <h3 className="font-serif text-2xl text-nb-navy mb-2">Thank you!</h3>
            <p className="text-nb-navy/60">We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-nb-navy mb-1.5">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                className={INPUT_CLASS}
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-nb-navy mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className={INPUT_CLASS}
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-nb-navy mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="What's this about?"
                className={INPUT_CLASS}
                value={form.subject}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-nb-navy mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Tell us anything..."
                className={INPUT_CLASS}
                value={form.message}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-nb-blue text-white font-medium py-3.5 rounded-lg hover:bg-nb-navy transition-colors tracking-wide"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default ContactForm
