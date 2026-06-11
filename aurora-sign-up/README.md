# Aurora Sign Up

A modern, two-column registration interface. The left column plays a full-bleed
background video with a staggered hero reveal (brand, heading, and a 3-phase
onboarding step list); the right column holds the sign-up form with social
auth buttons, a divider, and a password visibility toggle.

Built with React 18, Tailwind CSS v4 (`@tailwindcss/vite`), `motion/react`,
and `lucide-react`. The entire app lives in `src/App.tsx` + `src/index.css`.

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run verify    # headless Playwright checks against the preview server
```
