# nexto-404-hero

A full-viewport (100vh, no scroll) 404 "Page Not Found" hero page for the
fictional **nexto.** brand — built with React + Vite + Tailwind CSS, DM Sans
(variable font) and Google Material Symbols Rounded.

## Highlights

- Layered fixed background: alien-spaceship PNG over a soft `to top left` gradient
- Navbar with dashed gradient bottom border, centered links and a gradient
  pill CTA with a circular chevron badge
- Hero title flanked by floating gradient-filled `cloud` / `favorite`
  Material Symbols (`floatSlow` animation, staggered delays)
- Inline highlight tags (`chat`, `define`) in the subtext
- Bottom-pinned navigation cards (Main Page / Showcase) with hover lift,
  icon scale and sliding chevron
- Mobile: hamburger → X morph, full-screen overlay sliding in with
  `cubic-bezier(0.77, 0, 0.175, 1)`, 38px/800 left-aligned links
- Breakpoints at 768px and 480px per spec

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```
