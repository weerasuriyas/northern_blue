# Northern Blue Plus — Wordmark Design

**Date:** 2026-02-22

## Summary

Add a superscript `+` accent to every visible "Northern Blue" wordmark across the site, styled in `text-nb-blue` to signal the plus-size brand identity without disrupting the typographic weight of the name.

## Visual Treatment

Use a `<sup>` HTML element (not the Unicode ⁺ character) for reliable rendering across fonts:

```jsx
Northern Blue<sup className="text-nb-blue">+</sup>
```

The `<sup>` tag provides browser-native superscript sizing and baseline offset. `text-nb-blue` (#4A90D9) makes the `+` a visible accent against the dark navy wordmark.

## Changes

### 1. `src/components/Navbar.jsx`

- Visible wordmark span: `Northern Blue` → `Northern Blue<sup className="text-nb-blue">+</sup>`
- `<a>` aria-label: `"Northern Blue — return to top"` → `"Northern Blue Plus — return to top"`

### 2. `src/components/Hero.jsx`

- `<h1>` content: `Northern Blue` → `Northern Blue<sup className="text-nb-blue font-sans text-3xl md:text-5xl align-super">+</sup>`
  - Note: the `<h1>` uses `font-serif text-5xl md:text-7xl`. The `<sup>` should use `font-sans` to keep the + clean, and a reduced text-size relative to the heading to look balanced.
  - Alternatively, rely on browser-native `<sup>` sizing (no extra classes needed) and let it inherit the serif font — simpler and consistent.

### 3. `src/components/Footer.jsx`

- `<p>` content: `Northern Blue` → `Northern Blue<sup className="text-nb-blue">+</sup>`

### 4. `src/components/ButterflyLogo.jsx`

- `aria-label`: `"Northern Blue butterfly logo"` → `"Northern Blue Plus butterfly logo"`

## Files NOT Changed

- The butterfly SVG artwork (unchanged)
- Tagline text ("Love your clothes, love our earth.")
- Vision/About copy
- The `admin@northernblue.ca` email address

## Accessibility

All `aria-label` attributes spell out "Northern Blue Plus" so screen readers announce the full brand name clearly rather than reading "+".
