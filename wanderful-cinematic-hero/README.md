# Wanderful — Cinematic Hero

Full-viewport cinematic hero for the travel brand **Wanderful**: fixed video
backdrop with GSAP mouse parallax, liquid-glass navigation, and staggered
fade-in hero copy. Built with React + TypeScript + Vite + Tailwind CSS,
GSAP, and lucide-react.

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve dist/
```

## Verify (headless, CLI-only)

```sh
npm run preview -- --port 4621 --strictPort &
node scripts/verify.mjs http://localhost:4621/
```

Asserts every observable requirement from `PROMPT.txt` (35 checks): exact
video source and playback rate, GSAP parallax transform, liquid-glass
backdrop blur, typography, copy, fade-ins, and console cleanliness.
