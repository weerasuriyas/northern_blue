# Tagline & Vision Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder hero tagline and About copy with real brand content, and add the tagline below the navbar wordmark on desktop.

**Architecture:** Three isolated text/structure changes across Hero, Navbar, and About. No new components, no new hooks. TDD: update the relevant failing tests first, then make the code change that satisfies them.

**Tech Stack:** React 19, Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: Update Hero tagline

**Files:**
- Modify: `src/test/Hero.test.jsx:9-12`
- Modify: `src/components/Hero.jsx:22-24`

**Context:** The existing test `'renders the tagline'` asserts `/style for every body/i`. That will fail once we change the text — so we update the test first, confirm it fails, then fix the component.

**Step 1: Update the failing test**

In `src/test/Hero.test.jsx`, change line 11:

```jsx
test('renders the tagline', () => {
  render(<Hero />)
  expect(screen.getByText(/love your clothes, love our earth/i)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run src/test/Hero.test.jsx
```

Expected: FAIL — `Unable to find an element with the text: /love your clothes, love our earth/i`

**Step 3: Update the Hero tagline text**

In `src/components/Hero.jsx`, replace the `<p>` tagline (currently line 22):

```jsx
<p className="text-nb-navy/60 text-lg md:text-xl tracking-wide text-center max-w-md">
  Love your clothes, love our earth.
</p>
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/test/Hero.test.jsx
```

Expected: 4 passed

**Step 5: Commit**

```bash
git add src/test/Hero.test.jsx src/components/Hero.jsx
git commit -m "feat: update hero tagline to real brand tagline"
```

---

### Task 2: Add tagline to Navbar logo group

**Files:**
- Modify: `src/test/Navbar.test.jsx`
- Modify: `src/components/Navbar.jsx:17-22`

**Context:** The navbar logo group is an `<a>` containing a butterfly SVG and a `<span>Northern Blue</span>`. We wrap the wordmark in a `flex flex-col` group and add the tagline below it, hidden on mobile (`hidden md:block`). No existing Navbar test will break — we just add a new one.

**Step 1: Add the new test**

In `src/test/Navbar.test.jsx`, add after the existing tests:

```jsx
test('renders brand tagline in navbar', () => {
  render(<Navbar />)
  expect(screen.getByText(/love your clothes, love our earth/i)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run src/test/Navbar.test.jsx
```

Expected: FAIL — `Unable to find an element with the text: /love your clothes, love our earth/i`

**Step 3: Update the logo group in Navbar**

In `src/components/Navbar.jsx`, replace the logo `<a>` interior (currently lines 17-22). The `<a>` tag itself and its `className`/`aria-label` stay unchanged — only the inner spans change:

```jsx
<a href="#" aria-label="Northern Blue — return to top" className="flex items-center gap-3 group">
  <span aria-hidden="true"><ButterflyLogo size={36} /></span>
  <span className="flex flex-col">
    <span className="font-serif text-xl text-nb-navy tracking-wide">
      Northern Blue
    </span>
    <span className="text-xs italic text-nb-navy/50 tracking-wide hidden md:block">
      Love your clothes, love our earth.
    </span>
  </span>
</a>
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/test/Navbar.test.jsx
```

Expected: 4 passed

**Step 5: Commit**

```bash
git add src/test/Navbar.test.jsx src/components/Navbar.jsx
git commit -m "feat: add brand tagline below wordmark in navbar (desktop only)"
```

---

### Task 3: Replace About copy and blockquote with real vision text

**Files:**
- Modify: `src/test/About.test.jsx:14-17`
- Modify: `src/components/About.jsx:21-43`

**Context:** Two things change in About:
1. The three placeholder paragraphs become two real vision paragraphs.
2. The blockquote changes from "Every woman deserves to feel beautiful…" to "Love your clothes, love our earth."

The existing test `'renders the pull-quote'` asserts `/every woman deserves/i` — it will fail and needs updating. The heading "Our Story" and the 2-column layout stay untouched.

**Step 1: Update the failing test**

In `src/test/About.test.jsx`, change the `'renders the pull-quote'` test (lines 14-17):

```jsx
test('renders the pull-quote', () => {
  render(<About />)
  expect(screen.getByText(/love your clothes, love our earth/i)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run src/test/About.test.jsx
```

Expected: FAIL — `Unable to find an element with the text: /love your clothes, love our earth/i`

**Step 3: Replace the paragraphs and blockquote**

In `src/components/About.jsx`, replace the `<div className="space-y-4 ...">` block and `<blockquote>` (currently lines 21-43) with:

```jsx
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
```

Note: Use `&amp;` for the `&` in JSX to avoid a lint warning, or keep `&` as-is — both render identically in the browser. The `text-lg md:text-xl` is already the responsive class from the mobile pass.

**Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 39 passed (all files)

**Step 5: Commit**

```bash
git add src/test/About.test.jsx src/components/About.jsx
git commit -m "feat: replace About placeholder copy with real vision statement and tagline quote"
```
