# Core Features — Gradient Cards

A static "Core Features" marketing section: a centered header block above three gradient feature cards (Smart Prompt Suggestions, API Access, Project Library). Purely styling — no JavaScript, no animations, no hover effects.

Built as plain HTML with a single inline `<style>` block and the Inter font from Google Fonts. The notable techniques are all CSS: `radial-gradient`/`linear-gradient` card backgrounds, gradient-clipped text via `-webkit-background-clip: text`, a responsive 3 → 2 → 1 column grid, inline SVG cursor and search icons, and a masked grid "mesh" overlay using CSS masks. The palette runs through warm golds, rose, and violet (`#FFB347`, `#F9ED96`, `#E5A1F5`, `#F8ACA0`) over a `#F4F8F9` card base and white page. Card 2 and Card 3 reference local SVGs under `assets/`.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
