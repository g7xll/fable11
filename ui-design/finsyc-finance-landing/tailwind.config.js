/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // The Finsyc components reference these font utility classes directly:
        //   font-onest / font-heading  -> Onest (display headings)
        //   font-inter                 -> Inter (UI / nav / body)
        //   font-sans                  -> Inter (default body)
        //   font-playfair              -> Playfair Display (italic accents)
        //   font-mono                  -> ui-monospace fallback
        // All three families are vendored locally in assets/fonts and declared
        // via @font-face in src/index.css, so the page renders fully offline.
        sans: ['"Inter"', "system-ui", "sans-serif"],
        inter: ['"Inter"', "system-ui", "sans-serif"],
        onest: ['"Onest"', '"Inter"', "system-ui", "sans-serif"],
        heading: ['"Onest"', '"Inter"', "system-ui", "sans-serif"],
        playfair: ['"Playfair Display"', "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
