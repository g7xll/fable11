# Asme — Hero Landing

Full-screen, single-viewport (100vh, no scroll) dark hero landing page.

- **Stack:** React 19 + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`) + Motion + Lucide React + hls.js
- **Type:** Inter (300–600) for UI, Instrument Serif for the hero heading
- **Background:** fullscreen HLS video stream from Mux (`stream.mux.com/...m3u8`) — plays natively where supported (`canPlayType("application/vnd.apple.mpegurl")`), otherwise attached through `hls.js` MediaSource
- **Navbar:** `liquid-glass` pill — luminosity-blended glass with a masked `::before` gradient border
- **CTA flow:** "Get early access" → email form with a 60 ms/char typewriter placeholder → submit flips `ArrowRight` to `Check` and types a confirmation → resets after 4 s

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # serve dist/
```

## Verified

- `npm run build` — clean production build
- Headless Chromium (Playwright, CLI-driven): heading/tagline/nav copy, Instrument Serif + Inter computed fonts, `backdrop-filter: blur(4px)` applied, no page scroll, video playing (`readyState=4`) on **both** the native-HLS and hls.js branches, autofocus, both typewriter placeholders character-perfect, Check-icon state, 4 s reset to button, zero console/page errors
