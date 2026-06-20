# Super Design — Warm Industrial Design System

An industrial-chic design system landing page centered on structural grids, warm gray tones, and high-impact editorial typography with technical "readout" accents. It stacks a sticky header, a split 12-column hero, a marquee ticker, an interactive project list, a philosophical parallax statement, a technical journal, and a massive dark footer.

The "warm industrial" palette runs on a `#EBEBE8` background with `#18181B` foreground, an electric-blue accent (`#0066FF`), and zinc-300 borders, all under a subtle 4% fractal-noise overlay and a fixed full-page 12-column grid of thin vertical hairlines. Type pairs Inter (weights 400/700/900, vendored locally) with italic Playfair Display, plus a system mono stack for 10px uppercase tracked labels and readouts. Animation is defined by high-inertia `cubic-bezier(0.16, 1, 0.3, 1)` transitions: stroke-text hero headings, a looping marquee, a `clip-path: inset()` image reveal on project-row hover with a cursor-following "View" circle, scroll-driven parallax, animated status pulses, and on-load reveal staggers. Layout stays strictly grid-aligned and rectangular, with rounded corners reserved for CTA buttons and status badges. Single self-contained `index.html`, fonts and grayscale imagery vendored locally, fully offline.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
