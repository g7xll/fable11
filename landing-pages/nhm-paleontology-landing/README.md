# NHM — Natural History Museum Landing

A monochrome, editorial landing page for a fictional Natural History Museum.
Built per the spec in `PROMPT.txt`.

- **Stack**: React 19 · Vite 6 · Tailwind CSS 4 · Motion (Framer Motion) · Lucide · TypeScript
- **Hero**: full-width geometric "NHM" SVG logotype (per-polygon slide-up reveal), mono sub-nav, delayed background video, specimen sidebar, mobile menu
- **Section 2**: "Explore Our World" — scroll-revealed display heading + action pills
- **Section 3**: dark "Ancient Collection" — overlapping pterodactyl, auto-cycling chapter list, and `SandTransitionImage` (SVG `feTurbulence`/`feDisplacementMap` sand-dissolve transitions)

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve dist/
```

## Verify (CLI, headless)

```sh
npm run build && npm run preview -- --port 4185 --strictPort &
node scripts/verify.mjs            # 49 DOM/behavior checks, desktop + mobile
```

`scripts/verify.mjs` needs `playwright` resolvable (install it in this project
or in a sibling project of this repo).
