# bags-editorial-collage

A three-section animated bags landing page — a faithful reproduction built with
**React + Vite + TypeScript + TailwindCSS + framer-motion**.

The page renders three sections back-to-back, with no wrappers between them:

1. **Hero** (`src/sections/Hero.tsx`) — a warm cream editorial sticker collage.
   The headline "Bags crafted / to move with / _your_ story" anchors a model
   photo surrounded by floating stickers (snap polaroid, gift card, smile,
   sticks, arrow, text-heart), a LOVE BAG label, a `(01)` watermark, and two
   tilted polaroid thumbnails that lift on hover.

2. **Collection** (`src/sections/Collection.tsx`) — a true-black, 4× viewport-tall
   scroll stage. A sticky envelope unfolds as you scroll: its triangular flap
   folds upward, six product photos peek out of the V opening, then fan into a
   single horizontal row while their captions stagger in. The envelope visuals
   fade out via `envelopeIn`, but the photos stay fully visible to the end of
   the section.

3. **PerfectMatch** (`src/sections/PerfectMatch.tsx`) — a torn-paper bridge into a
   soft grey field where six matching bags orbit slowly (a `requestAnimationFrame`
   engine) around the headline "Find your perfect _match_", pausing on hover with
   a 1.12 lift.

The four signature serif accent words — **your**, **elegance**, **new**,
**match** — share one component (`src/components/SerifGlowWord.tsx`): a dual-layer
`#EAFE79` glow halo behind a solid `#545454` fill, with a "tubular curl" sticker
entrance.

## Assets

Every image referenced by the spec
(`https://qclay.design/lovable/bags/${file}`) is **vendored locally** under
`public/assets/` and served from the site root, so the project is fully
self-contained and runs offline. `src/lib/constants.ts` keeps the original
`${ASSET}/${file}` join semantics.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite production build
```
