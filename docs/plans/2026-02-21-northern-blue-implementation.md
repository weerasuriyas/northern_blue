# Northern Blue Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Northern Blue apparel brand home page — nav, hero with geometric butterfly SVG, about section, contact form (UI-only), and footer — using Vite + React + Tailwind.

**Architecture:** Single-page React app with smooth-scroll anchor navigation. All sections are standalone components assembled in App.jsx. The butterfly is a hand-crafted SVG React component used in both the nav and hero.

**Tech Stack:** Vite 6, React 19, Tailwind CSS v3, Vitest, React Testing Library, jsdom

---

## Task 1: Scaffold project and configure tooling

**Files:**
- Modify: `vite.config.js` (already created by Vite scaffolding)
- Modify: `tailwind.config.js` (created by tailwind init)
- Create: `src/test/setup.js`
- Modify: `package.json` (add test script)

**Step 1: Scaffold Vite + React into current directory**

Run from `/Users/shanew/Documents/stuff/northern_blue`:
```bash
npm create vite@latest . -- --template react
```
When prompted "Current directory is not empty. Remove existing files and continue?", choose **Yes**.
When prompted to select framework, it should already be set by `--template react`.

Expected output: Scaffolded project files including `src/`, `index.html`, `package.json`, `vite.config.js`.

**Step 2: Install dependencies**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 3: Configure Tailwind content paths**

Edit `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nb-blue': '#4A90D9',
        'nb-navy': '#1B2F4E',
        'nb-sky': '#B8D9F0',
        'nb-bg': '#F8FAFD',
        'nb-cream': '#FAF7F2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
```

**Step 4: Configure Vitest in vite.config.js**

Replace the contents of `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

**Step 5: Create test setup file**

Create `src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

**Step 6: Add test script to package.json**

In `package.json`, update the `scripts` section to add:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 7: Write the first smoke test**

Create `src/test/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import App from '../App'

test('App renders without crashing', () => {
  render(<App />)
  expect(document.body).toBeTruthy()
})
```

**Step 8: Run the test — expect FAIL (App is still the Vite default)**

```bash
npm run test:run
```
Expected: test runs (may pass trivially since body always exists — that's fine for now).

**Step 9: Delete Vite boilerplate files**

Remove the default files that will be replaced:
```bash
rm src/App.css src/assets/react.svg public/vite.svg
```

**Step 10: Replace src/index.css with Tailwind directives**

Replace contents of `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: #F8FAFD;
  color: #1B2F4E;
}
```

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold vite+react project with tailwind and vitest"
```

---

## Task 2: ButterflyLogo SVG component

**Files:**
- Create: `src/components/ButterflyLogo.jsx`
- Create: `src/test/ButterflyLogo.test.jsx`

**Step 1: Write the failing test**

Create `src/test/ButterflyLogo.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import ButterflyLogo from '../components/ButterflyLogo'

test('renders butterfly logo SVG with accessible label', () => {
  render(<ButterflyLogo />)
  expect(screen.getByRole('img', { name: /northern blue butterfly logo/i })).toBeInTheDocument()
})

test('accepts a size prop', () => {
  const { container } = render(<ButterflyLogo size={48} />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveAttribute('width', '48')
})

test('accepts a className prop', () => {
  const { container } = render(<ButterflyLogo className="my-class" />)
  const svg = container.querySelector('svg')
  expect(svg).toHaveClass('my-class')
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- ButterflyLogo
```
Expected: FAIL — `Cannot find module '../components/ButterflyLogo'`

**Step 3: Implement the component**

Create `src/components/ButterflyLogo.jsx`:
```jsx
const ButterflyLogo = ({ size = 80, className = '' }) => (
  <svg
    viewBox="0 0 120 100"
    width={size}
    height={Math.round(size * (100 / 120))}
    className={className}
    aria-label="Northern Blue butterfly logo"
    role="img"
  >
    <defs>
      <linearGradient id="wgL" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A90D9" />
        <stop offset="100%" stopColor="#B8D9F0" />
      </linearGradient>
      <linearGradient id="wgR" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A90D9" />
        <stop offset="100%" stopColor="#B8D9F0" />
      </linearGradient>
    </defs>
    {/* Left upper wing */}
    <polygon points="58,42 8,8 10,52 44,60" fill="url(#wgL)" opacity="0.9" />
    {/* Right upper wing */}
    <polygon points="62,42 112,8 110,52 76,60" fill="url(#wgR)" opacity="0.9" />
    {/* Left lower wing */}
    <polygon points="56,64 14,62 20,92 55,74" fill="url(#wgL)" opacity="0.7" />
    {/* Right lower wing */}
    <polygon points="64,64 106,62 100,92 65,74" fill="url(#wgR)" opacity="0.7" />
    {/* Body */}
    <ellipse cx="60" cy="55" rx="3" ry="18" fill="#1B2F4E" />
  </svg>
)

export default ButterflyLogo
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- ButterflyLogo
```
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add src/components/ButterflyLogo.jsx src/test/ButterflyLogo.test.jsx
git commit -m "feat: add geometric butterfly SVG logo component"
```

---

## Task 3: Navbar component

**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/test/Navbar.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/Navbar.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../components/Navbar'

test('renders About and Contact nav links', () => {
  render(<Navbar />)
  expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about')
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact')
})

test('renders brand name', () => {
  render(<Navbar />)
  expect(screen.getByText(/northern blue/i)).toBeInTheDocument()
})

test('mobile menu toggles open and closed', () => {
  render(<Navbar />)
  const toggleBtn = screen.getByRole('button', { name: /toggle menu/i })
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  fireEvent.click(toggleBtn)
  expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  fireEvent.click(toggleBtn)
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- Navbar
```
Expected: FAIL — `Cannot find module '../components/Navbar'`

**Step 3: Implement the component**

Create `src/components/Navbar.jsx`:
```jsx
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
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- Navbar
```
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add src/components/Navbar.jsx src/test/Navbar.test.jsx
git commit -m "feat: add sticky navbar with mobile hamburger menu"
```

---

## Task 4: Hero section

**Files:**
- Create: `src/components/Hero.jsx`
- Create: `src/test/Hero.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/Hero.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import Hero from '../components/Hero'

test('renders the brand name heading', () => {
  render(<Hero />)
  expect(screen.getByRole('heading', { name: /northern blue/i })).toBeInTheDocument()
})

test('renders the tagline', () => {
  render(<Hero />)
  expect(screen.getByText(/style for every body/i)).toBeInTheDocument()
})

test('renders scroll-down link pointing to about section', () => {
  render(<Hero />)
  expect(screen.getByRole('link', { name: /scroll down/i })).toHaveAttribute('href', '#about')
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- Hero
```
Expected: FAIL — `Cannot find module '../components/Hero'`

**Step 3: Implement the component**

Create `src/components/Hero.jsx`:
```jsx
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
      <ButterflyLogo size={160} />
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
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- Hero
```
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add src/components/Hero.jsx src/test/Hero.test.jsx
git commit -m "feat: add hero section with butterfly centerpiece and tagline"
```

---

## Task 5: About section

**Files:**
- Create: `src/components/About.jsx`
- Create: `src/test/About.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/About.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import About from '../components/About'

test('renders Our Story heading', () => {
  render(<About />)
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()
})

test('has correct anchor id for smooth scroll', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).toBeInTheDocument()
})

test('renders the pull-quote', () => {
  render(<About />)
  expect(screen.getByText(/every woman deserves/i)).toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- About
```
Expected: FAIL — `Cannot find module '../components/About'`

**Step 3: Implement the component**

Create `src/components/About.jsx`:
```jsx
const About = () => (
  <section id="about" className="bg-nb-cream py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">

        {/* Left: founder photo placeholder */}
        <div className="flex justify-center md:justify-start">
          <div className="w-72 h-96 rounded-2xl bg-nb-sky/30 border-2 border-nb-sky/50 flex items-center justify-center text-nb-blue/40 text-sm">
            Founder photo
          </div>
        </div>

        {/* Right: story text */}
        <div>
          <h2 className="font-serif text-4xl text-nb-navy mb-6">Our Story</h2>

          <div className="space-y-4 text-nb-navy/70 leading-relaxed">
            <p>
              Northern Blue began with a simple belief: every woman deserves to feel beautiful,
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

          {/* Pull-quote */}
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

export default About
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- About
```
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add src/components/About.jsx src/test/About.test.jsx
git commit -m "feat: add about section with founder story and pull-quote"
```

---

## Task 6: ContactForm component

**Files:**
- Create: `src/components/ContactForm.jsx`
- Create: `src/test/ContactForm.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/ContactForm.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import ContactForm from '../components/ContactForm'

test('renders all form fields', () => {
  render(<ContactForm />)
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
})

test('renders the submit button', () => {
  render(<ContactForm />)
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
})

test('shows success message after form submit', () => {
  render(<ContactForm />)
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } })
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Hello' } })
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'I love your brand!' } })
  fireEvent.click(screen.getByRole('button', { name: /send message/i }))
  expect(screen.getByText(/thank you/i)).toBeInTheDocument()
})

test('has correct anchor id for smooth scroll', () => {
  const { container } = render(<ContactForm />)
  expect(container.querySelector('#contact')).toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- ContactForm
```
Expected: FAIL — `Cannot find module '../components/ContactForm'`

**Step 3: Implement the component**

Create `src/components/ContactForm.jsx`:
```jsx
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
    // TODO: wire up to email service (EmailJS, backend, etc.)
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-white py-24 px-6">
      <div className="max-w-xl mx-auto">

        {/* Heading */}
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

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- ContactForm
```
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add src/components/ContactForm.jsx src/test/ContactForm.test.jsx
git commit -m "feat: add contact form with success state (UI-only, backend TBD)"
```

---

## Task 7: Footer component

**Files:**
- Create: `src/components/Footer.jsx`
- Create: `src/test/Footer.test.jsx`

**Step 1: Write the failing tests**

Create `src/test/Footer.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

test('renders Northern Blue name in footer', () => {
  render(<Footer />)
  expect(screen.getByText(/northern blue/i)).toBeInTheDocument()
})

test('renders current year in copyright', () => {
  render(<Footer />)
  expect(screen.getByText(new RegExp(new Date().getFullYear().toString()))).toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- Footer
```
Expected: FAIL — `Cannot find module '../components/Footer'`

**Step 3: Implement the component**

Create `src/components/Footer.jsx`:
```jsx
import ButterflyLogo from './ButterflyLogo'

const Footer = () => (
  <footer className="bg-nb-navy py-10 px-6">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
      <ButterflyLogo size={32} />
      <p className="font-serif text-white/80 tracking-widest text-sm">
        Northern Blue
      </p>
      <p className="text-white/40 text-xs">
        &copy; {new Date().getFullYear()} Northern Blue. All rights reserved.
      </p>
    </div>
  </footer>
)

export default Footer
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- Footer
```
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add src/components/Footer.jsx src/test/Footer.test.jsx
git commit -m "feat: add navy footer with copyright"
```

---

## Task 8: Assemble App.jsx and finalize

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`
- Modify: `index.html`
- Modify: `src/test/App.test.jsx`

**Step 1: Update the smoke test to be meaningful**

Replace `src/test/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders all main sections', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /northern blue/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument()
})
```

**Step 2: Run to verify it fails**

```bash
npm run test:run -- App
```
Expected: FAIL — App still renders Vite boilerplate

**Step 3: Replace App.jsx with assembled components**

Replace `src/App.jsx`:
```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}

export default App
```

**Step 4: Update index.html with correct title and Google Fonts**

Replace the content of `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Northern Blue</title>
    <meta name="description" content="Northern Blue — apparel for plus-size women. Style for every body, every season." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 5: Verify main.jsx looks correct (no changes needed if default)**

Read `src/main.jsx` — it should already be:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
If it differs, update it to match the above.

**Step 6: Run all tests to verify everything passes**

```bash
npm run test:run
```
Expected: All tests PASS (should be 15 tests across all test files)

**Step 7: Run the dev server to visually verify**

```bash
npm run dev
```
Open `http://localhost:5173` in a browser. Verify:
- [ ] Nav bar is sticky with butterfly logo and "Northern Blue"
- [ ] Hero fills viewport with gradient, butterfly SVG, heading, tagline, chevron
- [ ] About section has cream background, two columns, pull-quote
- [ ] Contact form has all fields, submit shows thank you state
- [ ] Footer is navy with copyright
- [ ] Smooth scroll works when clicking nav links

**Step 8: Commit final assembly**

```bash
git add src/App.jsx src/main.jsx index.html src/test/App.test.jsx
git commit -m "feat: assemble home page — nav, hero, about, contact, footer"
```

---

## Done

All 9 tasks complete. The Northern Blue home page is live at `localhost:5173`.

**Next steps (future sessions):**
- Replace founder photo placeholder with real image
- Wire contact form to EmailJS or a backend mailer
- Add `/shop` route and product grid (Shopify/Stripe integration)
- Add SEO meta tags and Open Graph images
