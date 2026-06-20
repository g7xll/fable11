# Organic Intelligence

An editorial-tech hybrid template, branded **Organic Intelligence**, built on "premium fluidity": high-contrast typography, a signature curved "wave" layout architecture, and soft colored blurs instead of harsh shadows. The palette grounds warm cream (`#FCFBF9`) and rich charcoal (`#171717`) against a vibrant indigo accent (`#4338CA`).

Type pairs Playfair Display (serif, italic for emphasis words, hero at `13vw`) with Inter body and JetBrains Mono labels (0.3em+ tracking). The section flow runs: a `mix-blend-difference` fixed header with a pulsing "System Online" status pill, a 100vh hero over a drifting indigo/purple mesh gradient capped by the concave wave transition (a `border-radius: 50% 50% 0 0` curve with an "Initialize" button at its crest), a staggered 2-column work grid with depth-focused card hovers and draw-in rule lines, a sticky-split service accordion, and a dark footer with a 5rem top curve and radial indigo glow.

Imagery is entirely procedural CSS orb gradients, so the page is fully offline. Motion strictly uses `cubic-bezier(0.22, 1, 0.36, 1)`: 1000ms scroll reveals, a 30s mesh drift, a 3s button pulse, and JS-measured accordion open. Fonts are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
