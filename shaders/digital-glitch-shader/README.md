# Digital Glitch — Retro CRT Shader

A shadcn/ui integration of a retro-CRT glitch fragment shader rendered to a full-screen Three.js quad. The GLSL drives a tunable glitch effect: block displacement and horizontal tearing keyed off a 2D random/noise function, RGB channel shift, and scanlines — all parameterized by uniforms (`u_glitch_intensity`, `u_rgb_shift`, `u_scanline_density`, `u_scanline_opacity`, `u_base_color`) so the look can be dialed from subtle to broken-signal.

Built with React + TypeScript + Vite, using `three` and `lucide-react`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run verify    # node scripts/verify.mjs
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
