# CodeNest — Hero

High-end, dark-themed hero section for the fictional coding education platform
**CodeNest**. Built with React 18, TypeScript, Tailwind CSS, hls.js (HLS
background video with `enableWorker: false`), lucide-react icons, and the
Inter / Plus Jakarta Sans / Instrument Serif type stack.

Highlights:

- Full-screen Mux HLS background video at 60% opacity under layered
  left + bottom `#070b0a` gradients
- 200×200px "liquid glass" card (luminosity blend, 4px backdrop blur,
  1.4px XOR-masked gradient border frame) floated 50px above the headline
- SVG ellipse glow (25px gaussian blur, cyan/dark-green) and 25/50/75%
  vertical grid lines on desktop
- Functional mobile hamburger menu with full-screen dark overlay

## Run

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build
npm test           # vitest unit/DOM tests
npm run preview    # serve the production build
npm run verify     # headless Playwright spec verification (needs preview server)
```
