# Superdesign — Midnight Editorial

A single-page, dark-mode creative-agency landing page for a fictional AI product-design studio called Superdesign, built in the "Midnight Editorial" design language: a near-black `#050505` canvas, one warm coral `#FF6B50` accent, oversized editorial typography, and a quiet, gallery-like layout with generous negative space.

Sections run top to bottom: a fixed top nav, a floating glass bottom dock, a full-viewport typographic hero (the word `/design` at ~13vw), a "Why launch slow" two-card benefits grid, a staggered "Selected Work" gallery of four projects (Nebula, Quantum, Echo, Flux), and a giant "Let's Talk." CTA / footer. Type is set in Satoshi (variable) with Inter as fallback. Motion is restrained — everything is driven by hover micro-interactions (grayscale-to-color avatars, coral text/border flips, image opacity/scale, arrow-button coral fill, social-button lift) plus a single gentle float keyframe, not scroll choreography.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
