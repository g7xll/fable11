# Neuralyn — Dark Analytics Landing Page

A dark, full-bleed landing page for Neuralyn, a fictional analytics-dashboard SaaS. It has two sections: a full-viewport hero with a parallax dashboard composited over a looping background video, and a scroll-driven testimonial where each word lights up as you scroll. The aesthetic is pure-black, white type, a single italic serif accent word, and a "liquid glass" tag pill.

Built with React 18 + Vite and TypeScript, styled with Tailwind CSS 3 and shadcn/ui-style primitives (Radix Slot, CVA, clsx, tailwind-merge). Animation is Framer Motion (`useScroll`/`useTransform` for scroll-linked parallax and the word-by-word color reveal). Fonts (Inter, Instrument Serif) are self-hosted via Fontsource. Notable techniques: full-bleed breakout via `marginLeft: calc(-50vw + 50%)`, `mix-blend-mode: luminosity` image compositing, and a masked-pseudo-element "liquid glass" border.

## Run

```sh
npm install
npm run dev      # Vite dev server
npm run build    # tsc --noEmit && vite build
npm run preview  # preview the production build
npm run assets   # node scripts/generate-assets.mjs
npm run verify   # node scripts/verify.mjs
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
