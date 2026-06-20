# Real Magic — Ticker-Tape Scroll

A horizontal scroll experiment driven by GSAP ScrollTrigger. Instead of full-screen slides, the entire page is one continuous horizontal text flow — a single very long sentence read sideways like a ticker tape: *"In every bottle, discover the undeniable Real Magic of sharing pure Refreshment that brings us Together."* Inline SVG glyphs (a bottle, rising bubbles, the signature ribbon swoosh, a drop, clinking bottles, a heart) sit between the words, acting like punctuation and conjunctions rather than separate sections.

It uses a Coca-Cola "Real Magic" color system — a full flat red stage (`#f40009`) with cream type — and a single flex line as the only scrolling element. Anton drives the running uppercase words while Instrument Serif handles the faint connective words and italic accent words; the "huge" accent words (Magic, Together) render as cream text-stroke outlines for rhythm breaks. Variable per-item margins make the line feel hand-set.

The stage is pinned and vertical scroll maps to the line's horizontal travel via a scrubbed ScrollTrigger, with a depth parallax on accent words and idle, scroll-independent GSAP loops (drawing ribbon, rising bubbles, a beating heart) so nothing freezes. GSAP, fonts, and a grain/vignette overlay are all vendored locally; `prefers-reduced-motion` is respected.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
