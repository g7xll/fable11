# Cathedral Raymarch Shader

A shadcn/ui integration of a full-screen WebGL2 fragment shader rendered on a fullscreen-triangle. The shader is a compact Shadertoy-style raymarch: a tight loop steps a ray through a folded distance field built from nested `sin`/`cos` of the sample point, accumulating color weighted by depth and a `sin(p.y + …)` palette, then tone-maps the result with `tanh` — producing soft, vaulted, cathedral-like light volumes that drift over time.

The runtime is a self-contained `ShaderCanvas` React component with no-throw shader compile/link helpers, an `iResolution`/`iTime`/`iFrame`/`iMouse` uniform set, and WebGL context-loss handling.

Built with React + TypeScript + Vite + Tailwind CSS.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
