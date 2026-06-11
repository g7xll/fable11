# Fearless Vision Hero

A full-screen, video-background hero section — "Fearless / Vision / Delivered" — built to an exact design spec.

## Stack

- React 18 + Vite
- Tailwind CSS 3
- Framer Motion (staggered fadeDown / fadeUp variants + clip-reveal heading)
- Lucide React (`ArrowUpRight`, `X`)
- Inter (600) — uppercase, wide tracking throughout

## Highlights

- Autoplaying, looping, muted background video (`absolute inset-0 object-cover`)
- Three-tier responsive layout (mobile / `sm:` 640px / `md:` 768px)
- Right-aligned stats row with accent `+` glyphs (`#5E0ED7`)
- Giant clamped heading (`clamp(2rem, 9vw, 9rem)`, line-height 0.88) with per-word slide-up reveals
- Full-screen white mobile menu overlay with staggered link entrances, Escape-to-close, and body scroll lock

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # serve the build
```
