# NOCTIS — Cinematic Hero

A full-screen dark hero section with a cinematic, premium aesthetic, built for
an imagined independent picture house. The specified Cloudinary video plays
behind a letterboxed, film-graded frame: vignette, animated film grain,
viewfinder corner ticks, vertical credit rails, a ticking 24fps SMPTE
timecode, and a staggered title-card entrance.

**Type**: Italiana (display) · Cormorant italic (accent/body) · IBM Plex Mono
(credit micro-labels) — champagne gold on near-black.

## Stack

React 18 + TypeScript + Vite + Tailwind CSS v4.

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run build
npm run verify   # headless Chromium checks + screenshots
```

`scripts/verify.mjs` asserts the exact `<video>` element from `prompt.md`
(attributes, classes, source URL/type), full-viewport coverage, the dark
cinematic frame (vignette, grain, letterbox), typography, the ticking
timecode, mobile responsiveness, and console health.
