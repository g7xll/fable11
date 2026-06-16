# Moneta Key — Cinematic Preloader

A single-page, full-viewport cinematic preloader screen for **Moneta Key**. One
fixed full-screen overlay (`z-index: 9999`) on a near-black navy background
(`#080B14`), where a 1394 × 938 design canvas is uniformly scaled to fit the
viewport (object-fit `contain` behaviour) while edge ornaments stay pinned to
the real viewport corners.

It is a pure idle loader: progress climbs from 0 → 100 in irregular, realistic
chunks (bursts, stalls and crawls), and **never exits** — once it reaches 100 it
simply rests there with every loop still running.

## What's on screen

- Two soft radial blooms (inner blue-violet, outer deep blue).
- 30 twinkling particle dots.
- A glowing 3D sphere (`sphere-3.png`) rendered with `mix-blend-mode: color-dodge`,
  fading in blurred then breathing gently between scale 1 and 1.025.
- A flowing **dashed orbit line** drawn as an SVG path with a vertical fade mask,
  so the dashes appear to pass behind the sphere on the front side.
- A large concentric-circles SVG behind the sphere.
- Three decorative line ornaments (`line-c-1`, `line-c-2`, `line-c-3`), centred
  on the canvas.
- An 80 × 80 logo (`full-logo.svg`) revealed by two animated triangle masks that
  produce a continuous **wave-cut** sweep (3s loop, forever).
- The wordmark **MONETA KEY**.
- A curved, **canvas-based number arc** (0–100). The focal number scales up to
  1.35× with a cool-blue glow; the value eases inertially toward the chunked
  progress target.
- Four bouncing dots performing a continuous Mexican wave.
- `left.svg` / `right.svg` pinned flush to the actual viewport bottom corners.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v3 · framer-motion · Canvas 2D API.

## Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Page wrapper (`min-h-screen`, `backgroundColor: #080B14`). |
| `src/components/Preloader.tsx` | The full 13-layer composition + the `OrbitDot` helper (defined, kept for future use). |
| `src/components/PreloaderNumberArc.tsx` | The canvas-based curved 0–100 number scroller. |
| `public/assets/*` | All 8 sphere/circle/line/logo/ornament assets, **vendored locally**. |
| `public/fonts/inter-tight-latin.woff2` | Inter Tight, **vendored locally** (variable weight 100–900). |

All external assets and the Inter Tight font are vendored under `public/`, so the
project is fully self-contained and runs offline — no runtime hotlinks.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```
