# DesignPro — Video Hero

Full-screen hero section for a product design education platform: looping CloudFront
video background, pill navigation, and a "Become / Product Leader." headline whose
second line uses a `ShinyText` component — a framer-motion-driven gradient
(`#64CEFB` base, white shine, 100° spread) clipped to the glyphs and sweeping
left → right every 3 seconds.

## Stack

React 18 + TypeScript · Vite 6 · Tailwind CSS 4 · Framer Motion · Lucide React

## Scripts

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview -- --port 4180   # serve the build
node scripts/verify.mjs          # headless Playwright spec verification (51 checks)
```
