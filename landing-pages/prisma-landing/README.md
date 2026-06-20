# Prisma — Creative Studio Landing Page

A dark, moody, cinematic single-page landing site for Prisma, a fictional creative studio. Three stacked sections — Hero, About, and Features — sit on a black background with a warm cream accent (`#DEDBC8`). Headings use Almarai with Instrument Serif italic for accent words.

Built with React 18 + Vite and TypeScript, styled with Tailwind CSS 3. Animation is Framer Motion: pull-up word reveals (`WordsPullUp` / `WordsPullUpMultiStyle`), fade-ins, scroll-linked per-character opacity in the About paragraph, and staggered card entrances in Features. Notable techniques include inline SVG `feTurbulence` noise textures and `useInView` / `useScroll` + `useTransform` scroll-driven animation. Icons come from Lucide.

## Run

```sh
npm install
npm run dev      # Vite dev server
npm run build    # tsc && vite build
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
