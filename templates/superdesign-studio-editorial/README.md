# SD — Typography-First Editorial Studio

A typography-first creative-studio landing page in a strict black-and-white palette (`#000000` / `#FFFFFF`, with neutral grays for secondary metadata) built around Inter set at extreme weight and size contrasts. Motion is central, and images stay grayscale, shifting to full color on hover to keep the visual discipline.

The layout follows a spacious vertical flow: a fixed `mix-blend-difference` header, a massive display hero ("Design Studio") with a staggered per-letter reveal, a continuous motion marquee, a centered intro statement, a two-column project grid (six projects with title / category / year metadata), and a high-contrast dark footer. Signature components include a custom 32px `mix-blend-difference` cursor that lerps toward the mouse and scales 2.5× on interactive elements, and asymmetrical marquee cards using non-uniform border radii. All easing uses `cubic-bezier(0.16, 1, 0.3, 1)` for a premium feel, with text-span reveals sliding up over 1s and a 30s marquee that pauses on hover.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
