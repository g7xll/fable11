# Starship Shader

A shadcn/ui integration of a full-screen GLSL fragment shader rendered through React Three Fiber. A fullscreen plane carries a `ShaderMaterial` fed `iTime`, `iResolution`, and an `iChannel0` noise texture — a 256×256 `DataTexture` of random values with repeat wrapping generated at startup — which the fragment shader samples to drive its animated starship/space effect. Uniforms are updated each frame via `useFrame`.

Built with React + TypeScript + Vite + Tailwind CSS, using `three` and `@react-three/fiber`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
