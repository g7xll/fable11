# smart-prosthetics-hero

Single-page hero section for a smart prosthetics brand — fullscreen background
video, centered two-pill navbar, and bottom-left hero copy with hover
micro-interactions. Built with React + TypeScript + Tailwind CSS on Vite; the
entire page lives in `src/App.tsx`.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## Verify

```bash
npm run build
node scripts/verify.mjs
```

`scripts/verify.mjs` serves `dist/` and runs headless Chromium (Playwright)
assertions: exact video attributes/URL, wrapper styles, logo SVG, nav links,
pill backgrounds, hero text and sizes, hover states (CTA fill, arrow nudge,
nav link color), anchor count, and responsive breakpoints. It also captures
desktop/mobile screenshots under `scripts/`.
