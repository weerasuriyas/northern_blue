# Northern Blue Plus Wordmark Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a superscript `+` styled in `text-nb-blue` to every "Northern Blue" wordmark across the site, and update aria-labels to read "Northern Blue Plus" for screen readers.

**Architecture:** Four independent component edits — ButterflyLogo (aria-label only), Navbar (wordmark inner span), Hero (h1 content), Footer (brand name p). Each follows TDD: add a failing test for the new `<sup>` presence, then implement. The `<sup className="text-nb-blue">+</sup>` approach uses browser-native superscript sizing and positioning with no extra CSS needed.

**Tech Stack:** React 19, Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: ButterflyLogo — update aria-label

**Files:**
- Modify: `src/test/ButterflyLogo.test.jsx:6`
- Modify: `src/components/ButterflyLogo.jsx:14`

**Context:** The ButterflyLogo SVG has `aria-label="Northern Blue butterfly logo"`. The existing test asserts `{ name: /northern blue butterfly logo/i }`. After adding "Plus" to the aria-label, the regex won't match ("Northern Blue **Plus** butterfly logo" no longer contains the substring "northern blue butterfly logo"). This test WILL fail — update it first.

**Step 1: Update the failing test**

In `src/test/ButterflyLogo.test.jsx`, change line 6:

```jsx
test('renders butterfly logo SVG with accessible label', () => {
  render(<ButterflyLogo />)
  expect(screen.getByRole('img', { name: /northern blue plus butterfly logo/i })).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/ButterflyLogo.test.jsx
```

Expected: 1 failure — `Unable to find an accessible element with the role "img" and name matching /northern blue plus butterfly logo/i`

**Step 3: Update the aria-label in ButterflyLogo.jsx**

In `src/components/ButterflyLogo.jsx`, change line 14:

```jsx
      aria-label="Northern Blue Plus butterfly logo"
```

No other changes. The SVG artwork, viewBox, gradients, wing groups, and body ellipse are untouched.

**Step 4: Run all ButterflyLogo tests**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/ButterflyLogo.test.jsx
```

Expected: 5 passed

**Step 5: Run full suite**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run
```

Expected: 40 passed

**Step 6: Commit**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && git add src/test/ButterflyLogo.test.jsx src/components/ButterflyLogo.jsx && git commit -m "feat: update ButterflyLogo aria-label to Northern Blue Plus"
```

---

### Task 2: Navbar — add + superscript to wordmark and update link aria-label

**Files:**
- Modify: `src/test/Navbar.test.jsx`
- Modify: `src/components/Navbar.jsx`

**Context:** The current navbar wordmark inner span (from a previous feature) is:
```jsx
<span className="flex flex-col">
  <span className="font-serif text-xl text-nb-navy tracking-wide">
    Northern Blue
  </span>
  <span className="text-xs italic text-nb-navy/50 tracking-wide hidden md:block">
    Love your clothes, love our earth.
  </span>
</span>
```
The `<a>` wrapping all of this has `aria-label="Northern Blue — return to top"`. We add `<sup className="text-nb-blue">+</sup>` inside the first inner span, and update the `<a>` aria-label to "Northern Blue Plus — return to top". No existing tests will break (the `/northern blue/i` regex still matches). We add one new test for the `<sup>` presence.

**Step 1: Add the new failing test**

In `src/test/Navbar.test.jsx`, add after the existing 4 tests:

```jsx
test('wordmark includes plus superscript', () => {
  const { container } = render(<Navbar />)
  const sup = container.querySelector('sup')
  expect(sup).toBeInTheDocument()
  expect(sup.textContent).toBe('+')
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Navbar.test.jsx
```

Expected: 1 failure — `sup` is `null`

**Step 3: Update Navbar.jsx**

Two changes:

**Change 1** — the `<a>` aria-label (find `aria-label="Northern Blue — return to top"` and change it):
```jsx
<a href="#" aria-label="Northern Blue Plus — return to top" className="flex items-center gap-3 group">
```

**Change 2** — the wordmark inner span (find `Northern Blue` inside the `font-serif text-xl` span and add the sup):
```jsx
  <span className="font-serif text-xl text-nb-navy tracking-wide">
    Northern Blue<sup className="text-nb-blue">+</sup>
  </span>
```

The `flex flex-col` wrapper span and the tagline span below it are untouched.

**Step 4: Run all Navbar tests**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Navbar.test.jsx
```

Expected: 5 passed

**Step 5: Run full suite**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run
```

Expected: 41 passed

**Step 6: Commit**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && git add src/test/Navbar.test.jsx src/components/Navbar.jsx && git commit -m "feat: add plus superscript to navbar wordmark"
```

---

### Task 3: Hero — add + superscript to heading

**Files:**
- Modify: `src/test/Hero.test.jsx`
- Modify: `src/components/Hero.jsx`

**Context:** The Hero `<h1>` currently contains only the text "Northern Blue". The existing `'renders the brand name heading'` test uses `getByRole('heading', { name: /northern blue/i })` — this will still pass after the change (the accessible name "Northern Blue+" matches the regex). Add a new test specifically asserting the `<sup>` is present inside the `<h1>`.

**Step 1: Add the new failing test**

In `src/test/Hero.test.jsx`, add after the existing 4 tests:

```jsx
test('brand name heading includes plus superscript', () => {
  const { container } = render(<Hero />)
  const sup = container.querySelector('h1 sup')
  expect(sup).toBeInTheDocument()
  expect(sup.textContent).toBe('+')
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Hero.test.jsx
```

Expected: 1 failure — `h1 sup` is `null`

**Step 3: Update Hero.jsx**

In `src/components/Hero.jsx`, change the `<h1>` content (currently "Northern Blue"):

```jsx
    <h1 className="font-serif text-5xl md:text-7xl text-nb-navy tracking-widest mb-4 text-center">
      Northern Blue<sup className="text-nb-blue">+</sup>
    </h1>
```

The `className` is unchanged. Only the text content gains `<sup className="text-nb-blue">+</sup>`.

**Step 4: Run all Hero tests**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Hero.test.jsx
```

Expected: 5 passed

**Step 5: Run full suite**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run
```

Expected: 42 passed

**Step 6: Commit**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && git add src/test/Hero.test.jsx src/components/Hero.jsx && git commit -m "feat: add plus superscript to hero heading"
```

---

### Task 4: Footer — add + superscript to brand name

**Files:**
- Modify: `src/test/Footer.test.jsx`
- Modify: `src/components/Footer.jsx`

**Context:** The Footer renders `<p className="font-serif text-white/80 tracking-widest text-sm">Northern Blue</p>`. The existing footer test uses `getAllByText(/northern blue/i)` which will still pass regardless — so add a dedicated test for the `<sup>` presence.

**Step 1: Add the new failing test**

In `src/test/Footer.test.jsx`, add after the existing 2 tests:

```jsx
test('brand name includes plus superscript', () => {
  const { container } = render(<Footer />)
  const sup = container.querySelector('sup')
  expect(sup).toBeInTheDocument()
  expect(sup.textContent).toBe('+')
})
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Footer.test.jsx
```

Expected: 1 failure — `sup` is `null`

**Step 3: Update Footer.jsx**

In `src/components/Footer.jsx`, change the brand name `<p>` content:

```jsx
      <p className="font-serif text-white/80 tracking-widest text-sm">
        Northern Blue<sup className="text-nb-blue">+</sup>
      </p>
```

The `className` is unchanged.

**Step 4: Run all Footer tests**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run src/test/Footer.test.jsx
```

Expected: 3 passed

**Step 5: Run full suite**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && npm test -- --run
```

Expected: 43 passed

**Step 6: Commit**

```bash
cd /Users/shanew/Documents/stuff/northern_blue && git add src/test/Footer.test.jsx src/components/Footer.jsx && git commit -m "feat: add plus superscript to footer brand name"
```
