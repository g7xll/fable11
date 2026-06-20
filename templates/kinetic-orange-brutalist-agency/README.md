# Kinetic Orange

A digital-first brutalist agency / portfolio landing page for a fictional studio, **Superdesign®**, that uses heavy typography and continuous motion to create urgency. It holds a strict three-color system — electric orange (`#FF4D00`), black, and white — with thick 2px borders, skewed sections, looping marquees, and no gradients or soft pastels.

Type pairs a heavy black-weight display face (Archivo Black, always uppercase, tight tracking, 0.85–0.9 leading) with Space Mono for metadata and UI labels and Inter for body. The single vertically-scrolling page runs: a floating black pill nav, a typographic hero on orange with a `16vw` "SUPER / DESIGN" headline and a metadata row, a `skewY(-2deg)` black marquee band with two counter-scrolling text rows, a dark vertical service list, a giant "Let's Talk" CTA, and a footer.

Signature components include a rotating circular "scroll down" SVG indicator (360° over 12s) and brutalist service rows whose titles translate +16px and reveal a rotating orange arrow on hover. Marquees and the spin loop seamlessly; selection color flips black/orange and scrollbars are hidden.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
