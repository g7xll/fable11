# GroundAI — Landing Page

A single-page **TanStack Start v1** landing page for *GroundAI*, an interior-design AI
product. Built with **React 19**, **TypeScript**, **Tailwind v4**, **framer-motion**,
and **lucide-react**.

The page is one scrolling document composed of four stacked sections, in order:

1. **Hero** — full-bleed autoplaying video background, animated header that springs up
   from the bottom, an expanding glass nav pill, staggered headline reveal, and a
   word-by-word animated description.
2. **TrustedBy** — an infinite CSS marquee of partner brand wordmarks with edge fades.
3. **CraftExperiences** — three feature cards:
   - a spring-driven **style carousel** that cycles design aesthetics through a
     morphing glass pill,
   - a **chat card** whose skeleton bubble morphs into a real customer message,
   - an **adaptable list** with staggered, in-view reveals and a gradient mask.
4. **Testimonials** — a staggered two-column testimonial block with a word-animated quote.

## Stack

- TanStack Start (`@tanstack/react-start`) on file-based routing (`src/routes/index.tsx`)
- Tailwind CSS v4 via `@tailwindcss/vite`
- framer-motion for all animation
- lucide-react for the mobile menu icons

## Assets

Every image and the hero video are vendored locally under `public/assets/` and referenced
exclusively through the single `A` object in `src/lib/assets.ts`. The original remote source
(`https://qclay.design/lovable/groundai`) is recorded in `REMOTE_BASE` for provenance, but the
running app loads only local files, so it works fully offline.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # client + SSR + Nitro node-server bundle
npm run start    # serve the production build
```

## Verify

```bash
npm run typecheck   # tsc --noEmit
```

A walkthrough recording lives at [`demo.mp4`](./demo.mp4).
