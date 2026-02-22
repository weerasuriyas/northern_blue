# Landing Page Enhancements Design

**Date:** 2026-02-22

## Overview

Three additions to elevate the Northern Blue landing page from a clean brochure into a polished, realistic fashion e-commerce mock:

1. Announcement Bar
2. Featured Collections section
3. Scroll fade-up animations

---

## 1. Announcement Bar

**Component:** `src/components/AnnouncementBar.jsx`

**Behaviour:**
- Sits above the Navbar in `App.jsx` (not fixed — scrolls away naturally)
- Navy background (`bg-nb-navy`), white text
- Message: "Free shipping on orders over $75 · Shop now →"
- Dismissible via `useState` — × button closes it for the session
- No localStorage, no persistence needed (mock)

**App.jsx change:** Add `<AnnouncementBar />` above `<Navbar />`

---

## 2. Featured Collections

**Component:** `src/components/Collections.jsx`

**Section:** Inserted between About and ContactForm in `App.jsx`. Section ID: `#collections`.

**Navbar:** Add "Collections" link (`{ label: 'Collections', href: '#collections' }`) to `NAV_LINKS` in `Navbar.jsx`.

**Layout:** Responsive 2-column grid on md+, single column on mobile.

**Cards (4 total):**

| Title | Type | Tagline |
|---|---|---|
| Spring Collection | Seasonal | "Fresh florals, soft palettes — yours to wear." |
| Everyday Essentials | Style | "The pieces you reach for first, every morning." |
| Workwear Edit | Style | "Polished. Powerful. Perfectly you." |
| Weekend Casual | Style | "Easy fits for the days that belong to you." |

**Each card:**
- Placeholder image area: nb-sky tinted background (`bg-nb-sky/20`) with fixed aspect ratio (4:5)
- Collection name (serif, nb-navy)
- Tagline (nb-navy/60)
- Decorative "Explore" button (nb-blue outlined style, no action)
- Hover: gentle lift (`hover:-translate-y-1 transition-transform`)

**Section header:** ButterflyLogo (28px) + serif heading "Our Collections" — matches existing section header pattern.

---

## 3. Scroll Fade-Up Animations

**Hook:** `src/hooks/useFadeIn.js`
- Uses `IntersectionObserver` with `threshold: 0.15`
- Accepts a ref, adds `.visible` class when element enters viewport
- Fires once (`unobserve` after trigger)
- Checks `window.matchMedia('(prefers-reduced-motion: reduce)')` — skips animation if true

**CSS additions to `src/index.css`:**
```css
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

**Applied to (inner content only, not the section tag):**
- `About.jsx` — heading, image placeholder, and text block each get `.fade-in` with staggered delays
- `Collections.jsx` — heading and each card get `.fade-in` with staggered delays
- `ContactForm.jsx` — heading and form get `.fade-in`

Hero is exempt (visible on load).
