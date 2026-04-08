# Proposal: Migrating Northern Blue from Vite to Next.js

## What We Have Now

A React + Vite single-page app (SPA). Vite is a build tool — it bundles your React code and serves it as a static site. Everything runs in the browser.

## Why Switch to Next.js

### 1. Google Will Actually Find Your Products

Vite SPAs send an empty HTML page to the browser, then JavaScript fills in the content. Google can index this, but it's slower and less reliable. Next.js pre-renders pages on the server — Google gets fully-formed HTML with product titles, descriptions, and images immediately. This means your products show up in search results faster and rank higher.

### 2. Faster on Mobile

With Vite, a customer on a phone has to download all the JavaScript, then the page appears. With Next.js, the server sends a ready-to-view page instantly — the customer sees products before JavaScript even finishes loading. This matters for shoppers on slower connections.

### 3. No Separate Backend Server Needed

With Vite, we'd need to build and run a separate Express.js server to handle admin authentication and securely talk to Shopify's Admin API. With Next.js, API routes are built in — one app, one deployment, less to maintain.

### 4. Built-In Image Optimization

Product images are critical for a clothing brand. Next.js has `next/image` which automatically resizes, compresses, and lazy-loads images from Shopify's CDN. With Vite, you'd need to set this up manually.

### 5. Built-In Font Optimization

Next.js loads Google Fonts (Playfair Display, Inter) at build time and self-hosts them. No layout shift when fonts load — the page looks right from the first frame.

### 6. Better for E-Commerce Long-Term

Next.js is the standard for headless Shopify storefronts. Shopify's own reference implementation uses Next.js. This means more community resources, examples, and proven patterns to follow.

## What It Costs

| Concern | Reality |
|---------|---------|
| Migration effort | ~1 day. The existing components move as-is — just add `'use client'` and update imports. |
| Learning curve | Minimal. It's still React. The main new concept is server vs. client components. |
| Hosting | Deploys to Vercel (free tier available) or any Node.js host. Similar to current setup. |
| Existing tests | Keep Vitest — works with Next.js. Tests need minor import path updates. |

## What Stays the Same

- All existing React components (Navbar, Hero, About, Collections, etc.)
- Tailwind CSS styling and color system
- Design, animations, and brand identity
- Vitest test suite

## Comparison

| | Vite SPA | Next.js |
|---|---|---|
| SEO for products | Poor (client-rendered) | Excellent (server-rendered) |
| Mobile speed | Slower first load | Instant page display |
| Admin backend | Separate Express server | Built-in API routes |
| Image optimization | Manual | Automatic |
| Shopify ecosystem fit | Generic | Industry standard |
| Migration cost | N/A | ~1 day |

**Recommendation:** Migrate to Next.js before building any e-commerce features. It's a small upfront investment that pays off across every phase of the project.
