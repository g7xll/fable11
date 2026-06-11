# Datacore Video Hero

A responsive, full-screen hero section for a hotel-booking web app — built with React,
TypeScript, and Tailwind CSS over an opaque, full-bleed video background.

## Highlights

- **Video background**: absolute-positioned HTML5 `<video>` (autoplay / loop / muted /
  playsinline), `object-cover` across `min-h-screen`, no overlay — fully opaque.
- **Navbar**: transparent top overlay (`z-20`) with the "Future" logo mark (spec SVG path,
  white fill), center-left nav links (Manrope 14px medium, `hover:opacity-80`), and Sign In /
  Get Started actions. On mobile it collapses to a hamburger that opens a full-screen black
  overlay menu with staggered link reveals and body scroll-lock.
- **Hero content**: glassmorphism tagline pill ("New — Say Hello to Datacore v3.2"),
  Instrument Serif headline (5xl → 96px, line-height 1.1, italic *and*), Inter subtext at
  70% white capped at 662px, and Cabin CTA buttons in brand purple `#7b39fc` and dark purple
  `#2b2344` that lighten on hover.
- **Motion**: one orchestrated page-load entrance — pill, headline, subtext, and CTAs rise in
  with staggered delays; disabled under `prefers-reduced-motion`.

## Fonts

Manrope (UI/nav) · Cabin (buttons/tags) · Instrument Serif (headline) · Inter (body), loaded
via Google Fonts.

## Run

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # serve dist on :4173
```

## Verify (CLI, headless)

```bash
npm run build && npm run preview &
npm run verify    # Playwright checks: desktop 1440px + mobile 390px
```
