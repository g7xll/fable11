# AI Builder Dark Hero

Dark mode hero section for an AI website builder — fixed transparent navbar,
HLS background video (Mux stream via hls.js with Safari fallback), Instrument
Sans / Instrument Serif typography, gradient-clipped headline, and staggered
Motion entrance animations. Built per the exact spec in `PROMPT.txt`.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `motion` (animations), `hls.js` (video streaming), `lucide-react` (icons)

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run verify   # headless Playwright checks against the production build
```

`npm run verify` boots `vite preview`, asserts every observable prompt
requirement (layout, fonts, gradient text, animation end-states, HLS playback,
overlays), and saves desktop + mobile screenshots to `screenshots/`.
