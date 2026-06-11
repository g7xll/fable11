# Ironclad — Password Manager Hero

A password manager landing page hero section built with React 18, TypeScript, Tailwind CSS 3, Framer Motion, and Lucide React.

- Full-viewport looping background video
- Geometric SVG logo + navbar (desktop links/pills, mobile hamburger)
- Framer Motion slide-in mobile menu (backdrop blur + staggered links)
- Animated hero: inline-icon headline, subtext, "Get It Free" CTA with shared `fadeUp` variants

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # tsc + vite build
npm run preview  # serve dist on :4173
```

## Verify (headless, CLI-only)

```sh
npm run build && npm run preview &
node scripts/verify.mjs
```

Runs 50 Playwright checks across desktop (1440×900) and mobile (390×844): video attributes, CSS variables, fonts, navbar, hero styles, entrance animations, and the mobile menu open/dismiss flow. Screenshots land in `screenshots/`.
