# Radial Shader

A shadcn/ui integration of a full-screen WebGL2 fragment shader rendered on a fullscreen-triangle. The Shadertoy-style shader builds a radial, rotating burst: it works in polar coordinates (`atan(p.y, p.x)`) and accumulates color across a short loop, gating each spoke with a time- and angle-driven `smoothstep`/`cos` term so the pattern spins and pulses. Standard `iResolution` / `iTime` / `iFrame` / `iMouse` uniforms drive the animation.

The runtime is a self-contained React canvas component with WebGL context-loss handling and DPR-aware sizing. This project has no Three.js dependency.

Built with React + TypeScript + Vite + Tailwind CSS.

## Run

```sh
npm install
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview    # serve the production build
npm run typecheck  # tsc -b --noEmit
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
