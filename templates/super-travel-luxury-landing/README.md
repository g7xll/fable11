# Super Travel — Luxury Editorial Travel Landing

A high-contrast, single-page luxury travel landing built entirely on League Spartan, using weight and letter-spacing for hierarchy. The palette is warm off-white (`#FDF8F3`), secondary `#F5F0EB`, charcoal text (`#262626`), and a signature dusty-rose accent (`#E4A4BD`) — solid muted colors only, no vibrant gradients.

The layout runs on a 12-column grid: a full-viewport hero with a ~15vw headline ("Luxury / journeys"), a three-column services grid, a signature staggered two-column portfolio grid (right items offset down 100px), and a multi-column footer. Imagery is grayscale by default and reveals color on hover, paired with a scale to 1.08. Motion is weighted via `cubic-bezier(0.16, 1, 0.3, 1)` at 1s, with scroll-triggered reveal-up wrappers (IntersectionObserver at 0.15) and a floating concierge badge on a slow 4s vertical bounce. Navigation uses glassmorphism (`rgba(253, 248, 243, 0.8)` + `blur(12px)`).

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
