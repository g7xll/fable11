# LUMIÈRE — Cinematic Streaming Hero

A full-viewport, no-scroll cinematic streaming hero. A looping background
video sits behind a masked `backdrop-blur-xl` veil that dissolves toward the
middle of the screen (blur only — no dark gradient), liquid-glass pill
buttons with a 1.4px gradient rim, and a `blurFadeUp` entrance where every
element resolves in with staggered delays (0–900ms).

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 + Lucide React, Inter (300–700) from Google Fonts.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run verify   # headless Chromium spec verification (Playwright)
```

`npm run verify` builds nothing itself — run `npm run build` first. It boots
`vite preview`, then asserts every `prompt.md` requirement: video attributes
and layering, mask gradients, liquid-glass computed styles (including the
`::before` rim), animation stagger timing, hero copy, responsive visibility
at 1440/768/375px, and the mobile menu open/close interaction. Screenshots
land in `screenshots/`.
