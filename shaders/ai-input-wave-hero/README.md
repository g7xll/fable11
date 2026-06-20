# AI Input Wave Hero

A shadcn/ui integration of an animated hero where a Three.js audio-style waveform of instanced bars rises behind an AI prompt box. The bars are driven by two keyframed sine waves (gain / frequency / wavelength tweened on a looping GSAP timeline) and rendered through a post-processing chain of `UnrealBloomPass` plus a custom film-grain `ShaderPass`. The bars sheare at a fixed rotation angle, taper to a fixed-pixel tip in the fragment shader, and accumulate a per-bar glow that follows the pointer.

The overlay is a centered title, subtitle, and a prompt `textarea` with an animated typing placeholder that cycles through suggestions, alongside a glassy mini-navbar. The whole component is exposed as `HeroWave` with props for title, subtitle, placeholder, and an `onPromptSubmit` callback.

Built with React + TypeScript + Vite + Tailwind CSS, using `three` and `gsap`.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run verify    # node verify.mjs
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
