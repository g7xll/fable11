# Editorial Naturalism

A high-contrast dark-mode design system that blends "digital naturalism" with brutalist technicality. Branded **STUDIO/NORD**, it sits on a stone-tinted black (`#0C0A09`, never pure `#000`) with warm charcoal surfaces, off-white stone text, and a signature acid-lime accent (`#D4F268`). A fixed 4%-opacity fractal-noise overlay (mix-blend overlay) keeps the dark surfaces from reading flat.

Typography is a dual system: Newsreader serif in light weights (200–400) with frequent italic emphasis words for headings, and Instrument Sans for UI and body, plus a system mono for technical `Fig. No` identifiers. Signature touches include serrated postage-stamp edge dividers (radial-gradient masks), a glassmorphism pill nav, an arched hero image container with a rotated lime sticky-note badge, a folder-style tabbed content section, a grayscale→color showcase grid with one offset card, and a rotated sticky-note CTA.

Vanilla JS handles the nav scroll state, folder-tab switching with a fade, and staggered scroll reveals; the sticky-note float is CSS-only. Transitions use `300ms cubic-bezier(0.4, 0, 0.2, 1)` and respect `prefers-reduced-motion`.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
