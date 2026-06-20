# Generative Mountain Scene

A shadcn/ui integration of a generative mountain landscape built in Three.js. A 128×128 `PlaneGeometry` is displaced by a time-driven `ShaderMaterial` (rendered solid — `wireframe: false`, double-sided — for a gap-free surface) and viewed through a tilted perspective camera, producing an undulating mountain terrain that animates over time.

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
