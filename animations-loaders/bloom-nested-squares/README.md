# Bloom — Nested Squares

A looping animated loader built as a shadcn/ui-style component. Twenty-five concentric square outlines, each with progressively larger padding, scale and rotate in an endlessly reversing bloom — staggered by a per-index delay so the rings ripple outward and back.

The component (`NestedSquares`) is a React + TypeScript piece styled with Tailcss and animated with Framer Motion. Each square uses a gradient `border-image` running through a violet/purple palette (rgb 147,51,234 → 124,58,237), animating `scale` 0 → 2 and `rotate` 0 → 180 over a 2s `easeInOut` tween that repeats with `repeatType: "reverse"`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # serve the build
npm run verify    # project verification script
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
