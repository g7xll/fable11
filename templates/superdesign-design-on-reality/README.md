# Superdesign — Design on Reality

A poster-modernist, reality-first landing page for a developer tool that "designs on reality, not mockups." The aesthetic is strict: a 12-column grid, a cream base (`#E3E2DE`) with a single cobalt-blue accent (`#1351AA`), jet-black text, hard 1px dividers (`#C7C7C7`), zero border-radius, and zero shadows. Type is General Sans throughout, with a monospace stack reserved for tiny index numbers. The whole page sits inside a centered `max-w-[1600px]` column framed with visible left/right borders.

Each section follows the same pattern — a sticky 3-column label sidebar (uppercase, tracked, `#7A7A7A`) running down the left of an oversized headline block in the right 9 columns — across Manifesto, System, Workflow, Why Different, and Access. Section-to-section separation is always a single hairline border-bottom. The only motion is fast linear 0.3s color changes on hover (cells, typographic list items, and the Poster Button, which swaps between cobalt and black). No scroll animation, parallax, shadows, or rounded corners anywhere.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
