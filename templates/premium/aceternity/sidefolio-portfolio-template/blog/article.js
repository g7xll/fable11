/* Renders a single blog article. Expects window.ARTICLE_SLUG. */

const LOREM_BODY = [
  "Velit cillum fugiat proident pariatur anim proident laborum incididunt magna in labore adipisicing veniam quis. Ut et exercitation dolor in enim quis. Et est excepteur exercitation voluptate in qui duis nulla in anim ut commodo deserunt nisi. Dolor pariatur irure occaecat Lorem mollit veniam adipisicing.",
  "Deserunt qui ea do et laborum ad id. Tempor laborum aute fugiat tempor eu. Amet sint sint proident pariatur eiusmod mollit excepteur excepteur. Dolore cillum nulla enim tempor ad.",
  "Laborum quis proident ut anim consectetur. Consequat fugiat eiusmod qui officia duis eu minim cillum do qui. Sunt sit veniam minim ad id sunt magna est enim.",
  "Consectetur est sunt minim culpa quis aute officia incididunt ea laboris nulla officia dolor. Cupidatat cupidatat esse veniam cillum labore ullamco aliqua ex. Cillum incididunt ipsum laborum dolor enim incididunt consectetur id consectetur magna. Consequat mollit non ea cupidatat exercitation. Consequat reprehenderit eiusmod nisi ea esse id ut est consequat eu aliqua do quis.",
  "Occaecat commodo velit ea consectetur ut sit. Duis eiusmod ad tempor nisi magna dolore incididunt ea dolore. Commodo proident eiusmod consequat cupidatat consectetur adipisicing dolor commodo tempor labore non dolore Lorem consectetur.",
];

const CLEAN_CODE = `import React from "react";
import { motion } from "framer-motion";

export const BoxesContainer = () => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);
  let colors = [
    "--sky-300",
    "--pink-300",
    "--green-300",
    "--yellow-300",
    "--red-300",
    "--purple-300",
    "--blue-300",
    "--indigo-300",
    "--violet-300",
  ];
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      style={{
        transform: \`translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)\`,
      }}
      className="absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0"
    >
      {rows.map((_, i) => (
        <motion.div key={\`row\` + i} className="w-16 h-8 border-l border-slate-700 relative" />
      ))}
    </div>
  );
};`;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function codeBlock(file, code) {
  return `
  <div class="codeblock">
    <div class="codeblock__bar">
      <span class="codeblock__file">${file}</span>
      <button class="codeblock__copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span></button>
    </div>
    <pre><code>${esc(code)}</code></pre>
  </div>`;
}

// per-article body (faithful to source: clean-code + dark-mode carry code, others are prose)
function bodyFor(slug) {
  if (slug === "clean-code") {
    return (
      `<p>${LOREM_BODY[0]}</p><p>${LOREM_BODY[1]}</p><p>${LOREM_BODY[2]}</p><p>${LOREM_BODY[3]}</p><p>${LOREM_BODY[4]}</p>` +
      `<h3 class="cal" style="font-size:1.125rem;margin:2rem 0 0.5rem">Code Snippet</h3>` +
      codeBlock("BoxesContainer.tsx", CLEAN_CODE)
    );
  }
  if (slug === "dark-mode-with-nextjs") {
    return (
      `<p>${LOREM_BODY[0]}</p><p>${LOREM_BODY[1]}</p>` +
      codeBlock("ThemeProvider.tsx", `import { ThemeProvider } from "next-themes";\n\nexport function Providers({ children }) {\n  return (\n    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>\n      {children}\n    </ThemeProvider>\n  );\n}`) +
      `<p>${LOREM_BODY[2]}</p><p>${LOREM_BODY[3]}</p><p>${LOREM_BODY[4]}</p>`
    );
  }
  // prose-only articles
  return LOREM_BODY.concat(LOREM_BODY.slice(0, 3)).map((p) => `<p>${p}</p>`).join("");
}

const ART_DATES = {
  "clean-code": "August 18, 2023",
  "how-to-win-clients": "August 18, 2023",
  "tailwindcss-tips-and-tricks": "August 18, 2023",
  "dark-mode-with-nextjs": "April 19, 2023",
};

const a = window.ARTICLES.find((x) => x.slug === window.ARTICLE_SLUG);
document.getElementById("app").innerHTML = `
  <a class="back-arrow" href="../blog.html">&larr;</a>
  <h1 class="cal h1">${a.title}</h1>
  <p class="article-date">${ART_DATES[a.slug]}</p>
  <img class="article-hero" src="../${a.image}" alt="${a.title}" />
  <div class="prose">${bodyFor(a.slug)}</div>
`;

window.SidefolioChrome.mountChrome("articles", "../");
