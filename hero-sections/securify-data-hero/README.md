# securify — data-security hero

A full-screen hero section for a fictional data-security SaaS called **securify**, built with React + TypeScript + Tailwind CSS (Vite).

- Looping fullscreen background video with a bottom fade-to-black gradient
- Floating pill-shaped navbar (brand pill, link pill, "get started" button)
- Three giant staggered lowercase headline words — "protect / your / data" — scaled with `vw` units
- Diagonal-divider stat blocks (+65k startups, +1.5b gb protected, +300k downloads)
- Palette: pure black, white, neutral-900 and white-opacity variants; typeface: Readex Pro

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm test                 # vitest unit tests (jsdom)
npm run build            # tsc --noEmit + vite build
npm run preview &        # serves dist on :4723
npm run verify           # playwright headless checks (desktop + mobile)
```
