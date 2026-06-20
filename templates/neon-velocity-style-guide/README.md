# Neon Velocity

A minimalist yet aggressive style-guide / landing template that blends brutalist structure (heavy borders, massive type) with futuristic glass effects. It runs on deep black (`#050505`, never pure black) and vibrant neon lime (`#BFFF00`), with a 3%-opacity fractal-noise overlay, large blurred refraction glows, and glassmorphism panels.

Type pairs Plus Jakarta Sans (800, tight tracking) for uppercase headlines with Geist Mono for wide-tracked technical labels and Inter for body. Within a 1600px container the page flows: a header with a "laser button," a hero where a 3D-tilted glass card (`perspective(1000px) rotateX(15deg)`) sits behind a massive headline in a sharp 12px white border-box plus a tabular-nums countdown, a 3-column bento of luminosity cards, a social-proof avatar stack with neon-bordered portraits and a glass pill form, a footer, and a fixed mobile bottom-nav pill.

Signature components: the laser button (sweeping 45° light gradient on hover), luminosity cards that react to mouse proximity with an accent spotlight, and a live JS countdown. All transitions use `cubic-bezier(0.16, 1, 0.3, 1)`; hero corners stay sharp while cards use 2rem radii. Fonts and avatars are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
