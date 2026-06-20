# Moving Circles Shader

A shadcn/ui integration of a full-screen GLSL fragment shader rendered through React Three Fiber. A fullscreen plane carries a `ShaderMaterial` whose fragment shader animates a field of moving circles driven by `uTime` and `uResolution` uniforms (updated each frame via `useFrame`), with depth test/write disabled so it draws as a flat full-bleed background.

Built with React + TypeScript + Vite + Tailwind CSS, using `three` and `@react-three/fiber`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
