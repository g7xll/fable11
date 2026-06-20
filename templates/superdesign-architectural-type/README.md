# Superdesign — Architectural Type System

A minimalist, monochrome Swiss-brutalist interface built on pure black (`#000`) and white (`#fff`) with a single functional indigo accent (`#6366F1`). Typography is the primary visual element: Inter Tight (weight 900, tight tracking, uppercase) for massive headlines, JetBrains Mono for technical metadata, and Inter for body. Layouts are divided strictly by 0.5px hairline borders applied per-side so adjacent cells share one line, with a fractal-noise SVG overlay at 5% opacity for tactile grain.

The hero is a 2×2 grid spelling SU / PER / DE / SIGN, each segment pinned to its cell's bottom-left and revealed with a staggered translate on load. A four-column command bar holds an email input, a JOIN button, a live HH:MM:SS countdown (tabular-nums, dimmed separators), and stacked underscore system labels. Below sits a three-card bento feature grid with hover-revealed geometric shapes, including a 45°→90° rotating square. Everything is 0px radius except the two pill/circle nav controls; depth comes solely from linework, contrast, and noise.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
