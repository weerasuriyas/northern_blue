# Northern Blue — Home Page Design

**Date:** 2026-02-21
**Status:** Approved
**Tech stack:** Vite + React + Tailwind CSS

---

## Project Overview

Northern Blue is an apparel storefront for plus-size women. The brand is named after the Northern Blue butterfly — a symbol of transformation, beauty, and lightness. The website's home page is the initial launch, with e-commerce (Shopify/Stripe) planned as a future addition.

---

## Brand Identity

**Tone:** Warm, welcoming, inclusive. Approachable without being casual. Empowering without being preachy.

**Color Palette:**
- Primary blue: `#4A90D9` (bright, friendly)
- Deep navy accent: `#1B2F4E`
- Soft sky: `#B8D9F0`
- Near-white background: `#F8FAFD`
- Warm cream (About section): `#FAF7F2`

**Typography:** Refined semi-serif or humanist sans-serif for headings; clean sans-serif for body. Elegant but approachable.

**Logo:** Abstract geometric butterfly SVG — symmetrical wing shapes built from clean lines with a blue gradient fill. No stock imagery. Implemented as a React SVG component.

---

## Page Sections

### 1. Navigation Bar

- Sticky, translucent off-white background with soft blue bottom border
- Left: geometric butterfly SVG logo + "Northern Blue" wordmark
- Right: smooth-scroll anchor links — **About**, **Contact**
- Mobile: collapses to hamburger menu
- Built to accommodate a future **Shop** link

### 2. Hero

- Full viewport height (`100vh`)
- Soft radial blue gradient background (sky blue fading to near-white)
- Centered layout:
  - Abstract geometric butterfly SVG as visual centerpiece
  - "Northern Blue" heading in large refined type below the butterfly
  - Tagline: *"Style for every body. Every season."*
  - Animated scroll-down chevron at the bottom

### 3. About

- Warm cream background (`#FAF7F2`)
- Smooth-scroll anchor (`#about`)
- Two-column desktop layout, stacked on mobile:
  - **Left:** Rounded placeholder image (for founder photo)
  - **Right:** "Our Story" heading, text combining founder's personal journey with brand mission and values
  - Pull-quote below text: *"Every woman deserves to feel beautiful, exactly as she is."* — styled in blue italic

### 4. Contact Form

- White background, centered max-width container
- Smooth-scroll anchor (`#contact`)
- Heading: "Get in Touch" with small butterfly icon accent
- Fields: Name, Email, Subject, Message (textarea)
- **Send Message** CTA button — filled blue, rounded, hover darkens
- Inputs: rounded borders, blue focus ring, clean labels
- Form is UI-only — `onSubmit` handler is a placeholder; ready to wire up to a backend/email service later
- Includes a friendly pending/success state in the UI

### 5. Footer

- Soft navy background (`#1B2F4E`)
- Centered copyright line and small butterfly icon
- Placeholder structure for future shop nav links

---

## Architecture

```
northern-blue/
  src/
    components/
      Navbar.jsx         — sticky nav with mobile hamburger
      ButterflyLogo.jsx  — abstract geometric SVG component
      Hero.jsx           — full-viewport hero section
      About.jsx          — two-column founder/mission section
      ContactForm.jsx    — UI-only contact form
      Footer.jsx         — simple footer
    App.jsx              — root, assembles sections
    index.css            — Tailwind base + custom CSS vars
  index.html
  vite.config.js
  tailwind.config.js
```

---

## Implementation Notes

- SVG butterfly is built as a pure React component — no image files for the logo
- Tailwind custom colors configured in `tailwind.config.js` for brand palette
- Smooth scroll behavior via `scroll-behavior: smooth` on `html` + anchor `href="#section"`
- Mobile-first responsive design throughout
- No backend required for initial launch — contact form UI only
- Nav and component structure anticipates adding a `/shop` route later

---

## Future Scope

- Add **Shop** page with product grid (Shopify or Stripe integration)
- Wire up contact form to EmailJS or a backend mailer
- Add product photography and replace placeholder images
- SEO meta tags and Open Graph setup
