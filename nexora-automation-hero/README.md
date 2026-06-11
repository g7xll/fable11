# Nexora Automation Hero

A SaaS landing hero for **Nexora** — "The Future of *Smarter* Automation". A single
100vh, no-scroll page: minimal navbar, fullscreen ambient background video, Instrument
Serif display type over Inter body text, and a fully custom-coded (no images) Mercury-style
banking dashboard preview floating in a frosted-glass frame that intentionally overflows
and clips at the bottom of the viewport.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 3 (+ `tailwindcss-animate`), all colors via semantic `hsl(var(--token))` design tokens
- framer-motion staggered entrance animations
- lucide-react icons, shadcn/ui Button

## Run

```bash
npm install
npm run dev
```

## Verify (CLI only)

```bash
npm run build
npm run preview &   # serves dist on :4173
npm run verify      # headless Playwright checks (desktop + mobile) + screenshots
```
