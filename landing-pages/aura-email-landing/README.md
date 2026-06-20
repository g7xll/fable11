# Aura — AI-Native Email Client Landing Page

A premium, AI-native email client landing page called **Aura**. The aesthetic is dark (base `#0c0c0c`), cinematic, and glassy: a looping fullscreen background video, a shiny gradient-clip headline, a macOS-style menu bar, a realistic inbox mockup, and a custom "liquid-glass" card treatment.

Built with React 18 + TypeScript on Vite, styled with Tailwind CSS, animated with Motion (Framer Motion), and using Lucide icons. Notable techniques include SVG `feTurbulence` noise filters, a gradient-clip shiny-text animation, a CSS mask-composite border for the glass cards, and a fixed fullscreen background video. Sections run navbar → hero → menu bar → inbox mockup → feature triage → logo cloud → testimonials → pricing → final CTA.

## Run

```sh
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc --noEmit) and build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
