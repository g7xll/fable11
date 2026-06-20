# Emerald Glass

A glassmorphism design-system showcase, branded **Obsidian**, built around depth-focused layouts and a monochrome palette with vibrant emerald highlights (`#34D399`). It deliberately moves between two modes: a dark, immersive hero (deep black, translucent glass layers, grain overlay) and a clean light-mode feature set on soft zinc gray (`#F4F4F5`).

Type is Inter throughout — tight-tracked headings (weight 500–700, -0.05em), light body in zinc-500, and 10px uppercase wide-tracked labels. Glass containers use `rgba(255,255,255,0.05)` with 12–20px backdrop blur and a 1px white/10 border; major section wrappers hold a consistent 2.5rem (40px) radius. Within a 1600px container the page tiers through a floating glass navbar, the dark hero with a massive low-opacity background word and a stack of glass stat cards, a light feature grid with a floating "system analysis" panel, a dark productivity block with a 3D-transformed mock window, a bento pricing grid, and a dark footer.

Signature components include a pill action button with a nested circular icon and high-transparency glass stat cards; animations use `fade-in-up` entries on `cubic-bezier(0.16, 1, 0.3, 1)` and 105% hover scales.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
