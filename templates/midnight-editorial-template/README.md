# Midnight Editorial

A dark brutalist fashion template, branded **Midnight**, that blends brutalist typography with high-end editorial aesthetics. It sits on a near-black canvas (`#050505`, footer `#0A0A0A`) against pure white, punctuated by soft blurred orange/blue light leaks (120px blur, mix-blend-screen) for atmospheric depth, with ultra-subtle thin borders and sharp 2px corners.

Type uses Clash Display for massive uppercase headings (hero at `15vw`) and Inter for clean body, with 10px uppercase metadata labels. The 12-column editorial scroll runs: a `mix-blend-difference` fixed nav that inverts over light imagery, a full-height hero with an overlapping `15vw` "FORM / MATTER" headline and a floating description block, a 4-column stats grid, asymmetrical numbered content blocks with wide gutters, a full-width 21:9 parallax gallery, a two-up gallery with hover-reveal captions, and a centered footer with a giant clipped ghost wordmark.

Motion is reveal-up on `cubic-bezier(0.22, 1, 0.36, 1)` (1s, staggered via per-element delay), slow 2s image hover scales, and rAF scroll parallax. Imagery is high-contrast grayscale; fonts and images are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
