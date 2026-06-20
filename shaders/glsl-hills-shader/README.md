# GLSL Hills

A shadcn/ui integration of an animated rolling-hills terrain built in Three.js. A large subdivided `PlaneGeometry` is rotated flat and displaced in a `RawShaderMaterial` vertex shader using classic Perlin noise (`cnoise`), with the noise field scrolled over `time` so the hills continuously roll toward the camera. The component takes `width`, `height`, `cameraZ`, `planeSize`, and `speed` props.

Built with React + TypeScript + Vite + Tailwind CSS, using `three`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run verify    # node verify.mjs
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
