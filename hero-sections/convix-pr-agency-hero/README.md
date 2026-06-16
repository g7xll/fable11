# Convix PR Agency Hero

Full-viewport hero section for **Convix Software**, a PR-agency SaaS — built to exact spec
(see `PROMPT.txt`).

A looping background video sits inside a rounded, clipped hero shell on a light gray page
frame. On top: a floating white pill navbar (8-petal flower logo, hamburger under `md`),
a centered headline mixing Inter with italic Instrument Serif, and a three-card dashboard
preview (tick-mark gauges, settings form) that bleeds off the clipped bottom edge.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 3
- lucide-react icons
- Inter + Instrument Serif (Google Fonts)

## Run

```sh
npm install
npm run dev
```

## Verify (CLI / headless)

```sh
npm run build
npm run preview &
npm run verify   # Playwright checks across desktop / tablet / mobile viewports
```
