# Aurum

A dark-mode, luxury landing page for a high-end AI / creative tool. It pairs a monochromatic black base (`#0A0A0A`) with a gold-and-bronze accent palette (base `#A78B71`, light `#C9B8A0`, hover `#E8D5B7`), a radial dot-grid overlay, and glassmorphism cards (`rgba(255,255,255,0.03)` with 10px backdrop blur and a 1px white/10 border).

Typography mixes Playfair Display (italic) for editorial headings with Inter for UI precision and wide-tracked uppercase labels. The hero centers an interactive glass node surrounded by floating satellite media cards connected by dynamic SVG bezier curves with a pulsing-branch animation; satellite cards transition grayscale→color and lift on hover. Below: a glassmorphic features grid, a three-tier pricing section with a monthly/annual toggle, a two-column team section, a live notification pill with a breathing dot, and a multi-column footer.

The brief is strict about staying in the gold/bronze spectrum (no blue/purple tech gradients) and applying heavy letter-spacing on small uppercase text to hold the premium feel.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
