# Spatial Product Showcase

An animated earbud product showcase that switches between a "Left" and "Right" earbud via a floating, Dynamic-Island-style pill switcher. Selecting a side morphs the whole layout — the visual mirrors to the opposite side, the radial background gradient shifts, and the content (title, description, animated feature bars, battery, status) re-renders with spring transitions.

Built in React + TypeScript with Vite and Tailwind CSS (shadcn-style component structure). Animation is driven by Framer Motion: `AnimatePresence` for image/content swaps, `layout`/`layoutId` for the morphing layout and shared switcher surface, orbiting dashed rings, a breathing glow, a floating image bob, and width-animated feature meters with staggered delays. Icons come from `lucide-react`. Product data (titles, colors, stats, feature metrics) is defined in a single typed config object.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # serve the build
npm run verify    # project verification script
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
