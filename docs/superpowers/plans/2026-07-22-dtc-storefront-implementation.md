# High-Conversion DTC Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Awwwards-tier, ultra-converting mobile-first DTC storefront for the Simpliven™ Digital LED Mirror Alarm Clock.

**Architecture:** Single page responsive application built with HTML5, vanilla CSS3 design system, and ES6+ JavaScript. Features interactive media switcher (10 HD videos + 8 images), live millisecond countdown timer, interactive bundle builder, UGC video carousel, social proof ratings, FAQ accordion, and floating mobile sticky CTA.

**Tech Stack:** HTML5, Vanilla CSS3, JavaScript (ES6+), Google Analytics (G-9485GWMVDH), Netlify Deployment.

---

### Task 1: Core Storefront HTML Structure (`index.html`)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Write the full semantic HTML structure**

Update `index.html` to include all conversion sections: Announcement bar, Sticky Navbar, Hero video/image stage, Pricing & Millisecond Timer box, Finish/Bundle Selector, Risk-reversal badges, Problem vs Solution comparison, Feature grid, UGC Video Carousel, Verified Customer Reviews, FAQ Accordion, and Mobile Sticky Bottom Bar.

- [ ] **Step 2: Verify HTML validity and link tags**

Ensure Google Analytics script tag (`G-9485GWMVDH`) and Google Fonts (`Plus Jakarta Sans`, `Space Grotesk`) are properly included in `<head>`.

- [ ] **Step 3: Commit HTML structure**

```bash
git add index.html
git commit -m "feat: implement high-conversion DTC storefront HTML layout"
```

---

### Task 2: High-Conversion CSS Design System (`index.css`)

**Files:**
- Modify: `index.css`

- [ ] **Step 1: Implement DTC visual design tokens & mobile typography**

Define CSS variables for primary backgrounds (`#ffffff`, `#f8fafc`), high-contrast dark text (`#0f172a`), vivid callout gradients (`#ff3b30` to `#ff9500`), stock green (`#00e676`), and star gold (`#ffb703`).

- [ ] **Step 2: Add responsive grid & component styles**

Style Announcement marquee, Hero media frame (4:3 aspect ratio with live viewing pill), Thumbnail carousel, Price box, Bundle cards with ribbon, Guarantee badges, UGC Video swipe gallery, Review cards, FAQ accordion, and Mobile Sticky Bottom Bar (fixed to bottom).

- [ ] **Step 3: Commit CSS stylesheet**

```bash
git add index.css
git commit -m "style: implement high-conversion DTC CSS stylesheet and mobile responsiveness"
```

---

### Task 3: Interactive Storefront Logic (`index.js`)

**Files:**
- Modify: `index.js`

- [ ] **Step 1: Implement hero media gallery switcher**

Write `switchMedia(type, src)` function to swap main stage between HD videos (`assets/videos/video1.mp4` - `video10.mp4`) and high-res images with active thumbnail borders.

- [ ] **Step 2: Implement finish selector & bundle calculation**

Write `selectColor(name, element)` and `selectBundle(type, element)` to update pricing dynamically and toggle active card states.

- [ ] **Step 3: Implement live millisecond countdown timer & FAQ accordion**

Add millisecond timer update loop (`09m : 42s : 18ms`) and accordion click handlers for FAQ items.

- [ ] **Step 4: Commit JavaScript logic**

```bash
git add index.js
git commit -m "feat: implement storefront interactive media, timer, bundle builder and FAQ logic"
```

---

### Task 4: Deployment Config & Verification (`netlify.toml`)

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Create Netlify configuration**

Write `netlify.toml` with publish directory `./` and caching headers for MP4 videos and PNG images.

- [ ] **Step 2: Verify local HTTP server execution**

Run python/node server to verify local page rendering and asset loading cleanly at `http://localhost:8080`.

- [ ] **Step 3: Commit Netlify config and finalize**

```bash
git add netlify.toml
git commit -m "chore: add Netlify deployment configuration for storefront"
```
