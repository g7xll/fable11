# transform-data-hero

A modern hero section over a full-screen looping video background, built with
React + TypeScript + Vite + Tailwind.

The video loop uses a **custom requestAnimationFrame fade system** (no CSS
transitions): 250ms fade-in on load and on every loop restart, 250ms fade-out
once 0.55s remain, a `fadingOutRef` guard against repeated `timeupdate`
triggers, and a 100ms black hold on `ended` before seeking back to 0 and
fading back in. Every new fade cancels running frames and resumes from the
current opacity.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Fonts: Schibsted Grotesk, Inter, Noto Sans, Fustat (400–700)
- All SVG icons live in a single imported file: `src/components/icons.tsx`

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run verify   # headless Playwright verification of the whole spec
```

`npm run verify` serves `dist/`, opens headless Chromium and asserts the
typography, layout, spacing, colors, component content, and the full video
fade lifecycle (fade-in → fade-out near end → reset → fade back in).
