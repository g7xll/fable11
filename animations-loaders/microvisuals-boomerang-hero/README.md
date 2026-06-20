# MicroVisuals — Boomerang Video Hero

A fullscreen hero for a fictional AI image-generation product, MicroVisuals. As in its sibling, the background video plays once, every frame is snapshotted into offscreen canvases, and the frames then ping-pong forward and backward forever on a display canvas — a "boomerang" loop at ~30fps that never touches `video.currentTime`.

Built in React 18 + TypeScript with Vite and Tailwind CSS. Three effects drive it: frame capture (`requestVideoFrameCallback` with a `requestAnimationFrame` fallback), the boomerang render loop, and a GSAP pointer-lerp parallax that nudges the pre-scaled background toward the cursor. The layout adds a "liquid glass" navbar and buttons (backdrop-filter cards with gradient-masked borders), an oversized italic Instrument Serif title, and a bottom action row, all on a black canvas. Tailwind's default border radius is overridden to a full pill. Fonts: Instrument Serif, Barlow, and a self-hosted Dirtyline display face.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # serve the build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
