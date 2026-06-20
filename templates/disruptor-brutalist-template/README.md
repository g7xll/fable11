# Disruptor

A bold, industrial neo-brutalist style guide that merges brutalist architecture with modern UI components, themed around speed and high-output shipping. The palette is strictly limited to black (`#000`), dark grey (`#121212`), white, and a signature volt green (`#CCFF00`) — no gradients or soft shadows, only hard 4px/8px borders and solid offset "neo-shadows."

Type is Ranchers for massive all-caps headlines (up to 180px with 8px solid drop shadows), Space Mono for technical labels, Plus Jakarta Sans for body, and Archivo for numerals. Components lean physical: brutalist buttons translate into their shadow on press, tilted "sticker" cards, vertical-RL text strips, and a fixed multi-strip "blueprint" sidebar on large screens. Sections (divided by 8px black borders) run from a hero with a fused brutalist email form, through a rotated social-proof sticker bar, a black-vs-volt comparison grid, a 3-column process blueprint with giant watermark numbers, a live countdown timer, and a marquee footer.

Motion is deliberately hard-edged: button press translations, a live JS countdown, scrolling marquees, and scroll reveals — all respecting `prefers-reduced-motion`.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
