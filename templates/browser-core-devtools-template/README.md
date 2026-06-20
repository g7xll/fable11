# Browser-Core Modernism

A high-density, technical landing page that simulates a browser workspace — the entire site lives inside a simulated browser frame with macOS traffic lights, an active tab, an address bar, and an extension area. The palette is "browser-core modernism": gray-and-white panels (`#F3F4F6` background, white panels, `#E5E7EB` borders) with sharp cyan highlights (`#06B6D4`), a 20px pattern-grid background, and custom 10px UI scrollbars.

Typography is Inter for headings and JetBrains Mono for all technical labels, on a strict 4px/8px spacing grid. The hero splits a 72px technical headline (with a pulsing `v2.0 RELEASED` tag) against a simulated UI window where a CSS-driven fake cursor loops between cards, triggering a dark inspector tooltip that reveals CSS props in cyan mono. Further sections include a changelog with cyan `+` bullets, a three-panel IDE-style workspace with a property inspector and a cyan selection box, a dark GitHub-README manifesto, and a `<details>`-based technical FAQ.

Motion is functional: 0.4s slide-up reveals via IntersectionObserver, the cursor-demo loop, and pulses — all disabled under `prefers-reduced-motion`.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
