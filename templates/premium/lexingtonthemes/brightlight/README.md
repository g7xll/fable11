# Brightlight — Email Delivery SaaS Website Template Clone (Vanilla HTML/CSS/JS)

[![Watch Demo](./poster.jpg)](./demo.mp4)

Brightlight is a pixel-faithful, same-to-same clone of the Brightlight template by Lexington Themes — a polished, multi-page email delivery SaaS marketing site. The template features a clean white design with warm accent (rust/orange) and sand color palettes driven by CSS custom properties, Geist and Noto Serif typefaces, a hero section with italic serif accents, a tabbed SDK code block with scrolling language logo marquee, feature grids, pricing section, blog with tag filtering, customer case studies, sign-in page, and a design system reference section (buttons, links, colors, typography). All pages are reproduced in plain HTML with the original compiled Tailwind CSS v4, locally vendored fonts and image assets. Generated with Claude Fable 5.

## Run

No build step required — serve statically:

```sh
python3 -m http.server
# Then open http://localhost:8000
```

Or open `index.html` directly in a browser.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Blog listing | `blog/index.html` |
| Blog post | `blog/posts/1.html` (posts 1–10) |
| Blog tag | `blog/tags/innovations.html` (all tags) |
| Sign in | `sign-in.html` |
| Customers | `customers/1.html` |
| Design system | `system/overview.html`, `system/buttons.html`, `system/links.html`, `system/colors.html`, `system/typography.html` |

The full build spec is in `prompt.md` and the clone in action is shown in `demo.mp4`.

## Credits

Faithful clone of an existing design, recreated for study/learning. All credit for the original design goes to its creators.

**Original:** Lexington Themes — <https://lexingtonthemes.com/viewports/brightlight>

---

Part of the [Templates](../) collection in the [claude-directory](../../) — an open-source gallery of AI-generated UI built with Claude Fable 5. [Browse the live gallery](https://pulkitxm.com/claude-directory).
