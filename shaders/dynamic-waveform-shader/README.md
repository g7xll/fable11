# Dynamic Waveform Shader

A shadcn/ui integration of an animated waveform fragment shader rendered to a full-screen Three.js quad. The GLSL builds flowing, layered waveform bands whose look is tuned by uniforms for two colors (`u_color1`, `u_color2`), `u_complexity`, `u_amplitude`, and `u_frequency`, with a `u_mouse` / `u_mouse_distortion` pair that warps the field around the pointer for an interactive feel.

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
