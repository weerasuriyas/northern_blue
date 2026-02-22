# Landing Page Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an announcement bar, a featured collections section, and scroll fade-up animations to the Northern Blue landing page.

**Architecture:** Three independent features. Tasks 1–2 create new components with tests. Task 3 wires them into App and updates Navbar. Task 4 builds a reusable `useFadeIn` hook backed by `IntersectionObserver` with CSS transitions. Tasks 5–6 apply the hook to existing and new components.

**Tech Stack:** React 19, Vite, Tailwind CSS (nb-navy/nb-blue/nb-sky/nb-cream palette), Vitest + @testing-library/react

---

### Task 1: AnnouncementBar component

**Files:**
- Create: `src/components/AnnouncementBar.jsx`
- Create: `src/test/AnnouncementBar.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/AnnouncementBar.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import AnnouncementBar from '../components/AnnouncementBar'

test('renders the promo message', () => {
  render(<AnnouncementBar />)
  expect(screen.getByText(/free shipping on orders over/i)).toBeInTheDocument()
})

test('renders a dismiss button', () => {
  render(<AnnouncementBar />)
  expect(screen.getByRole('button', { name: /dismiss announcement/i })).toBeInTheDocument()
})

test('hides when dismiss button is clicked', () => {
  render(<AnnouncementBar />)
  fireEvent.click(screen.getByRole('button', { name: /dismiss announcement/i }))
  expect(screen.queryByText(/free shipping/i)).not.toBeInTheDocument()
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- AnnouncementBar
```

Expected: FAIL — module not found.

**Step 3: Implement AnnouncementBar**

Create `src/components/AnnouncementBar.jsx`:

```jsx
import { useState } from 'react'

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-nb-navy text-white text-sm py-2.5 px-6 flex items-center justify-center relative">
      <p className="text-white/90 tracking-wide text-center">
        Free shipping on orders over $75&nbsp;&nbsp;·&nbsp;&nbsp;
        <span className="underline underline-offset-2 cursor-pointer">Shop now →</span>
      </p>
      <button
        aria-label="dismiss announcement"
        className="absolute right-4 text-white/50 hover:text-white transition-colors text-xl leading-none"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  )
}

export default AnnouncementBar
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- AnnouncementBar
```

Expected: 3 tests PASS.

**Step 5: Commit**

```bash
git add src/components/AnnouncementBar.jsx src/test/AnnouncementBar.test.jsx
git commit -m "feat: add dismissible AnnouncementBar component"
```

---

### Task 2: Collections component

**Files:**
- Create: `src/components/Collections.jsx`
- Create: `src/test/Collections.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/Collections.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import Collections from '../components/Collections'

test('renders Our Collections heading', () => {
  render(<Collections />)
  expect(screen.getByRole('heading', { name: /our collections/i })).toBeInTheDocument()
})

test('renders all 4 collection cards', () => {
  render(<Collections />)
  expect(screen.getByText('Spring Collection')).toBeInTheDocument()
  expect(screen.getByText('Everyday Essentials')).toBeInTheDocument()
  expect(screen.getByText('Workwear Edit')).toBeInTheDocument()
  expect(screen.getByText('Weekend Casual')).toBeInTheDocument()
})

test('renders 4 Explore buttons', () => {
  render(<Collections />)
  expect(screen.getAllByRole('button', { name: /explore/i })).toHaveLength(4)
})

test('has correct section id for smooth scroll', () => {
  const { container } = render(<Collections />)
  expect(container.querySelector('#collections')).toBeInTheDocument()
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- Collections
```

Expected: FAIL — module not found.

**Step 3: Implement Collections**

Create `src/components/Collections.jsx`:

```jsx
import ButterflyLogo from './ButterflyLogo'

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

const Collections = () => (
  <section id="collections" className="bg-white py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <ButterflyLogo size={28} />
        <h2 className="font-serif text-4xl text-nb-navy">Our Collections</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {COLLECTIONS.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl overflow-hidden border border-nb-sky/40 bg-white hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="aspect-[4/3] bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm tracking-wide">
              {c.title}
            </div>
            <div className="p-6">
              <span className="text-xs uppercase tracking-widest text-nb-blue/60 font-medium">
                {c.type}
              </span>
              <h3 className="font-serif text-2xl text-nb-navy mt-1 mb-2">{c.title}</h3>
              <p className="text-nb-navy/60 text-sm leading-relaxed mb-5">{c.tagline}</p>
              <button
                type="button"
                className="border border-nb-blue text-nb-blue text-sm font-medium px-5 py-2 rounded-lg hover:bg-nb-blue hover:text-white transition-colors"
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

export default Collections
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- Collections
```

Expected: 4 tests PASS.

**Step 5: Commit**

```bash
git add src/components/Collections.jsx src/test/Collections.test.jsx
git commit -m "feat: add Collections section with 4 product cards"
```

---

### Task 3: Wire AnnouncementBar + Collections into App; add Collections nav link

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/test/App.test.jsx`
- Modify: `src/test/Navbar.test.jsx`

**Step 1: Write the failing tests**

Add to `src/test/App.test.jsx` (after the existing test):

```jsx
test('renders Collections section', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /our collections/i })).toBeInTheDocument()
})

test('renders announcement bar', () => {
  render(<App />)
  expect(screen.getByText(/free shipping on orders over/i)).toBeInTheDocument()
})
```

Replace the existing test in `src/test/Navbar.test.jsx` (line 4–8) — update "renders About and Contact nav links" to also assert the Collections link:

```jsx
test('renders About, Collections, and Contact nav links', () => {
  render(<Navbar />)
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about')
  expect(screen.getByRole('link', { name: /collections/i })).toHaveAttribute('href', '#collections')
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact')
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- App Navbar
```

Expected: 2 App tests FAIL (Collections heading and announcement bar not rendered). Navbar test FAIL (collections link missing).

**Step 3: Update App.jsx**

Replace the full contents of `src/App.jsx`:

```jsx
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Collections from './components/Collections'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Collections />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}

export default App
```

**Step 4: Update Navbar.jsx NAV_LINKS**

In `src/components/Navbar.jsx`, replace lines 4–7:

```jsx
const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Collections', href: '#collections' },
  { label: 'Contact', href: '#contact' },
]
```

**Step 5: Run tests to verify they pass**

```bash
npm run test:run -- App Navbar
```

Expected: All App and Navbar tests PASS.

**Step 6: Run full suite**

```bash
npm run test:run
```

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx src/test/App.test.jsx src/test/Navbar.test.jsx
git commit -m "feat: wire AnnouncementBar and Collections into App, add Collections nav link"
```

---

### Task 4: useFadeIn hook + CSS

**Files:**
- Create: `src/hooks/useFadeIn.js`
- Create: `src/test/useFadeIn.test.jsx`
- Modify: `src/index.css`

**Step 1: Write the failing tests**

Create `src/test/useFadeIn.test.jsx`:

```jsx
import { renderHook } from '@testing-library/react'
import { useRef, act } from 'react'
import useFadeIn from '../hooks/useFadeIn'

let observerInstances

beforeEach(() => {
  observerInstances = []

  // Mock window.matchMedia (not implemented in jsdom)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
    }),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb
      this.observed = []
      observerInstances.push(this)
    }
    observe(el) { this.observed.push(el) }
    unobserve(el) { this.observed = this.observed.filter((e) => e !== el) }
    disconnect() { this.observed = [] }
  }
})

test('adds visible class when element intersects', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: true }])
  })

  expect(div.classList.contains('visible')).toBe(true)
  document.body.removeChild(div)
})

test('does not add visible class when not intersecting', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: false }])
  })

  expect(div.classList.contains('visible')).toBe(false)
  document.body.removeChild(div)
})

test('unobserves element after it becomes visible', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  act(() => {
    observerInstances[0].cb([{ isIntersecting: true }])
  })

  expect(observerInstances[0].observed).not.toContain(div)
  document.body.removeChild(div)
})

test('adds visible class immediately when prefers-reduced-motion is set', () => {
  // Override matchMedia to return reduced motion preference
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: () => {},
      removeListener: () => {},
    }),
  })

  const div = document.createElement('div')
  document.body.appendChild(div)

  renderHook(() => useFadeIn({ current: div }))

  // No observer trigger needed — should be visible immediately
  expect(div.classList.contains('visible')).toBe(true)
  document.body.removeChild(div)
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- useFadeIn
```

Expected: FAIL — module not found.

**Step 3: Create the useFadeIn hook**

Create `src/hooks/useFadeIn.js`:

```js
import { useEffect } from 'react'

const useFadeIn = (ref) => {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

export default useFadeIn
```

**Step 4: Add CSS to src/index.css**

Append to the end of `src/index.css`:

```css
/* Scroll fade-up animation */
@media (prefers-reduced-motion: no-preference) {
  .fade-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .fade-in.delay-1 { transition-delay: 0.1s; }
  .fade-in.delay-2 { transition-delay: 0.2s; }
  .fade-in.delay-3 { transition-delay: 0.3s; }
}
```

**Step 5: Run tests to verify they pass**

```bash
npm run test:run -- useFadeIn
```

Expected: 4 tests PASS.

**Step 6: Run full suite**

```bash
npm run test:run
```

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add src/hooks/useFadeIn.js src/test/useFadeIn.test.jsx src/index.css
git commit -m "feat: add useFadeIn hook and scroll fade-up CSS"
```

---

### Task 5: Apply fade-in to About

**Files:**
- Modify: `src/components/About.jsx`
- Modify: `src/test/About.test.jsx`

**Step 1: Write the failing test**

Add to `src/test/About.test.jsx`:

```jsx
test('image and text columns have fade-in class', () => {
  const { container } = render(<About />)
  const fadeEls = container.querySelectorAll('.fade-in')
  expect(fadeEls.length).toBeGreaterThanOrEqual(2)
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- About
```

Expected: FAIL — no `.fade-in` elements found.

**Step 3: Update About.jsx**

Replace the full contents of `src/components/About.jsx`:

```jsx
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
```

**Note:** `useFadeIn` uses `IntersectionObserver`, which is not implemented in jsdom. The existing About tests don't trigger scroll, so the `.visible` class won't be added during tests — but all existing tests will still pass because they test text content and headings, not animation state.

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- About
```

Expected: All 4 About tests PASS (3 existing + 1 new).

**Step 5: Commit**

```bash
git add src/components/About.jsx src/test/About.test.jsx
git commit -m "feat: apply scroll fade-in to About section"
```

---

### Task 6: Apply fade-in to Collections + ContactForm

**Files:**
- Modify: `src/components/Collections.jsx`
- Modify: `src/components/ContactForm.jsx`
- Modify: `src/test/Collections.test.jsx`
- Modify: `src/test/ContactForm.test.jsx`

**Step 1: Write the failing tests**

Add to `src/test/Collections.test.jsx`:

```jsx
test('heading and grid have fade-in class', () => {
  const { container } = render(<Collections />)
  const fadeEls = container.querySelectorAll('.fade-in')
  expect(fadeEls.length).toBeGreaterThanOrEqual(2)
})
```

Add to `src/test/ContactForm.test.jsx`:

```jsx
test('inner content has fade-in class', () => {
  const { container } = render(<ContactForm />)
  const fadeEl = container.querySelector('.fade-in')
  expect(fadeEl).toBeInTheDocument()
})
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:run -- Collections ContactForm
```

Expected: Both new tests FAIL — no `.fade-in` elements.

**Step 3: Update Collections.jsx**

Replace the full contents of `src/components/Collections.jsx`:

```jsx
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
    <section id="collections" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className="fade-in flex items-center gap-3 mb-12">
          <ButterflyLogo size={28} />
          <h2 className="font-serif text-4xl text-nb-navy">Our Collections</h2>
        </div>
        <div ref={gridRef} className="fade-in delay-1 grid md:grid-cols-2 gap-6">
          {COLLECTIONS.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden border border-nb-sky/40 bg-white hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="aspect-[4/3] bg-nb-sky/20 flex items-center justify-center text-nb-blue/30 text-sm tracking-wide">
                {c.title}
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-widest text-nb-blue/60 font-medium">
                  {c.type}
                </span>
                <h3 className="font-serif text-2xl text-nb-navy mt-1 mb-2">{c.title}</h3>
                <p className="text-nb-navy/60 text-sm leading-relaxed mb-5">{c.tagline}</p>
                <button
                  type="button"
                  className="border border-nb-blue text-nb-blue text-sm font-medium px-5 py-2 rounded-lg hover:bg-nb-blue hover:text-white transition-colors"
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
```

**Step 4: Update ContactForm.jsx**

In `src/components/ContactForm.jsx`, add the import and ref at the top of the component. Replace the current file with:

```jsx
import { useState, useRef } from 'react'
import ButterflyLogo from './ButterflyLogo'
import useFadeIn from '../hooks/useFadeIn'

const INPUT_CLASS =
  'w-full rounded-lg border border-nb-sky/60 bg-white px-4 py-3 text-nb-navy placeholder-nb-navy/30 focus:outline-none focus:ring-2 focus:ring-nb-blue/40 focus:border-nb-blue transition'

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const containerRef = useRef(null)
  useFadeIn(containerRef)

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
      <div ref={containerRef} className="fade-in max-w-xl mx-auto">
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
```

**Step 5: Run tests to verify they pass**

```bash
npm run test:run -- Collections ContactForm
```

Expected: All Collections tests (5) and ContactForm tests (6) PASS.

**Step 6: Run full suite**

```bash
npm run test:run
```

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add src/components/Collections.jsx src/components/ContactForm.jsx src/test/Collections.test.jsx src/test/ContactForm.test.jsx
git commit -m "feat: apply scroll fade-in to Collections and ContactForm"
```
