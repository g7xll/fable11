# Bloom — Liquid Glass Hero

Full-screen hero landing page for **Bloom**, an AI-powered plant/floral design
platform. A liquid glass morphism UI floats above a looping botanical video
background — strict grayscale, no colored accents.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 (grayscale HSL tokens, `--radius: 1rem`)
- lucide-react icons
- Poppins (display/body) + Source Serif 4 (italic serif accents) via Google Fonts

## Design notes

- Two glass tiers defined under `@layer components`:
  - `.liquid-glass` — light: `blur(4px)`, luminosity blend, gradient ring via a
    masked `::before` (`mask-composite: exclude`)
  - `.liquid-glass-strong` — heavy: `blur(50px)`, used for the left slab + CTA
- Two-panel split: left `w-[52%]` hero slab, right `w-[48%]` floating widgets
  (hidden below `lg`)
- No `border-*` classes anywhere — all edges come from the `::before` gradient ring
- Staggered `animate-rise` page-load reveal, disabled under
  `prefers-reduced-motion`

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # typecheck + production build
npm run preview   # serve the build
npm run generate:assets  # regenerate public/logo.png + src/assets/hero-flowers.png
node scripts/verify.mjs  # headless Playwright verification against the build
```
