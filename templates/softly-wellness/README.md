# Softly — Wellness Landing

A warm, mobile-first landing page for a digital-wellness app, built to feel like a "digital living room": minimalist, tactile, and intentionally slow. A single centered vertical column flows from a spacious hero through a horizontal scenario scroll, three stacked phone mockups, feature and testimonial sections, and an FAQ accordion into a high-contrast waitlist conversion.

The style is digital minimalism meets Gen-Z lifestyle: warm desaturated pastels (sage, lavender, peach, coral `#FFB7B2`) on warm paper `#FDFCF8`, a persistent paper-grain SVG overlay, high-radius blurred background blobs, and fluid low-velocity motion. Typography pairs the rounded Outfit sans-serif with Reenie Beanie cursive used only for expressive emphasis. Animations include IntersectionObserver reveal-on-scroll (opacity + translateY, staggered), a slow `float` keyframe for blobs, `pulse` for the coral "breathe" disc and live-status dot, and a height-animated FAQ accordion. Icons use Iconify (`lucide:*`).

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
