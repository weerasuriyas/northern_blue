# Tagline & Vision Integration — Design

**Date:** 2026-02-22

## Content

**Tagline:** "Love your clothes, love our earth."
**Vision:** "We strive to offer well made clothes that fit plus size bodies well. We believe in sourcing well made clothes from manufacturers that adhere to high labour standards & eco friendly products."

## Changes

### 1. Navbar (`src/components/Navbar.jsx`)

The logo group (butterfly + wordmark) gains a tagline line beneath "Northern Blue":

- Wrap the wordmark in a `flex flex-col` group
- Add `<span>` below "Northern Blue" with the tagline
- Classes: `text-xs italic text-nb-navy/50 tracking-wide hidden md:block`
- Hidden on mobile (`hidden md:block`) to keep the nav tight

Before:
```jsx
<span className="font-serif text-xl text-nb-navy tracking-wide">Northern Blue</span>
```

After:
```jsx
<span className="flex flex-col">
  <span className="font-serif text-xl text-nb-navy tracking-wide">Northern Blue</span>
  <span className="text-xs italic text-nb-navy/50 tracking-wide hidden md:block">
    Love your clothes, love our earth.
  </span>
</span>
```

### 2. Hero (`src/components/Hero.jsx`)

Replace the sub-heading tagline text only. No structural changes.

Before:
```jsx
<p className="text-nb-navy/60 text-lg md:text-xl tracking-wide text-center max-w-md">
  Style for every body. Every season.
</p>
```

After:
```jsx
<p className="text-nb-navy/60 text-lg md:text-xl tracking-wide text-center max-w-md">
  Love your clothes, love our earth.
</p>
```

### 3. About (`src/components/About.jsx`)

Replace the three placeholder paragraphs and the blockquote content with the real vision text.

**Paragraphs** (replace the entire `<div className="space-y-4 ...">` body):
- Paragraph 1: "We strive to offer well made clothes that fit plus size bodies well."
- Paragraph 2: "We believe in sourcing well made clothes from manufacturers that adhere to high labour standards & eco friendly products."

**Blockquote** (replace quote text only):
- New quote: "Love your clothes, love our earth."

Layout, styling, refs, and fade-in classes remain unchanged.

## Files Touched

| File | Change |
|------|--------|
| `src/components/Navbar.jsx` | Logo group: wrap wordmark in flex-col, add tagline span (desktop-only) |
| `src/components/Hero.jsx` | Replace tagline text |
| `src/components/About.jsx` | Replace 3 paragraphs + blockquote text with vision content |

## Tests

Existing tests cover structural anchors (IDs, headings, aria-labels) and should still pass.
Update any test that asserts the old tagline or About paragraph text if needed.
