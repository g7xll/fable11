// Per-project detail content + showcase rendering.
window.PROJECT_DETAIL = {
  "echo-ui": {
    title: "Echo UI v3",
    intro: "Echo UI is a comprehensive component library and design system built for modern web applications. It provides a cohesive set of accessible, customizable components that help teams ship beautiful interfaces faster while maintaining consistency across their products.",
    body: "Building Echo UI taught me the importance of developer experience. Every component was designed with both the end user and the developer in mind — clear APIs, comprehensive documentation, and sensible defaults that can be easily overridden. The result is a system that teams actually want to use.",
    shots: ["01", "02", "03", "04", "05"],
    captions: ["Component showcase", "Design tokens system", "Interactive documentation", "Component API", "Developer experience"],
    highlights: [
      "Built 50+ accessible components following WAI-ARIA guidelines",
      "Created a flexible theming system with CSS variables and Tailwind",
      "Implemented comprehensive Storybook documentation with interactive examples",
      "Achieved 98% test coverage with unit and integration tests",
    ],
    more: ["justos", "scalar"],
  },
  justos: {
    title: "JustOS",
    intro: "JustOS is a productivity operating system designed specifically for creators and makers. It combines task management, note-taking, and project planning into a unified workspace that adapts to how creative professionals actually work.",
    body: "The biggest challenge with JustOS was balancing flexibility with simplicity. Creators need tools that can adapt to their unique workflows, but they also need to be able to start working immediately without a steep learning curve. We solved this with a modular architecture that reveals complexity gradually.",
    shots: ["01", "02", "03", "04", "05"],
    captions: ["JustOS workspace", "Project dashboard", "Clean interface design", "Task management", "Note-taking interface"],
    highlights: [
      "Designed a modular workspace system with customizable layouts",
      "Built real-time collaboration features using WebSockets",
      "Implemented offline-first architecture with automatic sync",
      "Created a plugin system for extending functionality",
    ],
    more: ["happy-stats", "echo-ui"],
  },
  "happy-stats": {
    title: "Happy Stats",
    intro: "Happy Stats is a lightweight analytics dashboard built for developers who want clear insights without complex setup. It visualizes metrics like commits, deployments, and project activity in a fast, privacy-friendly way.",
    body: "Beyond the technical build, Happy Stats was also an exercise in product thinking. I wanted to design analytics that developers would actually enjoy using — clear typography, instant feedback, and no unnecessary clutter. Every chart was tested against real-world commit data to make sure it told a story at a glance. Building it reminded me how powerful simple, focused tools can be when they're made by someone who uses them every day.",
    shots: ["01", "02", "03", "04", "05"],
    captions: ["Dashboard overview", "Activity charts", "Real-time metrics", "Commit analytics", "Team insights"],
    highlights: [
      "Built a modular charting system using Recharts for clean, customizable visuals",
      "Designed a real-time update flow powered by Supabase subscriptions",
      "Implemented role-based dashboards for teams and individuals",
      "Optimized rendering for large datasets without sacrificing speed",
    ],
    more: ["cactus-plant", "justos"],
  },
  "cactus-plant": {
    title: "Cactus Plant",
    intro: "Cactus Plant is a realtime collaboration framework for building multiplayer experiences. It abstracts away the complexity of conflict resolution, presence awareness, and state synchronization, letting developers focus on building features.",
    body: "The hardest part of building Cactus Plant was handling edge cases — network partitions, out-of-order messages, and conflicting edits. We spent months perfecting our CRDT implementation to ensure that no matter what happens, data is never lost and conflicts are resolved deterministically.",
    shots: ["01", "02", "03", "04", "05"],
    captions: ["Collaboration in action", "Architecture overview", "Developer experience", "CRDT implementation", "Real-time sync"],
    highlights: [
      "Implemented CRDT-based conflict resolution for seamless collaboration",
      "Built a presence system showing real-time cursor positions and selections",
      "Created an efficient binary protocol reducing bandwidth by 70%",
      "Designed horizontal scaling architecture supporting 100k+ concurrent users",
    ],
    more: ["echo-ui", "happy-stats"],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const slug = document.body.dataset.slug;
  const d = window.PROJECT_DETAIL[slug];
  if (!d) return;
  const P = window.assetPrefix;
  const I = window.ICONS;
  const byId = (id) => document.getElementById(id);

  byId("d-title").textContent = d.title;
  byId("d-intro").textContent = d.intro;
  const projMeta = window.DATA.projects.find((p) => p.slug === slug);
  byId("d-cover").src = P + "assets/" + (projMeta ? projMeta.cover : "images/projects/" + slug + "/cover.webp");
  byId("d-body").textContent = d.body;

  // stack
  byId("d-stack").innerHTML = window.STACK_ICONS.map(
    (s) => `<span class="stack-icon">${s}</span>`
  ).join("");

  // showcase blocks alternate single + grid
  const sc = byId("d-showcase");
  let html = "";
  d.shots.forEach((n, i) => {
    const cap = d.captions[i] || "";
    html += `<div class="reveal" style="margin-top:${i === 0 ? 0 : "1.5rem"}">
      <div class="showcase-img" style="aspect-ratio:16/9"><img src="${P}assets/images/projects/${slug}/${n}.webp" alt="${cap}" loading="lazy"/></div>
      <p class="showcase-caption">${cap}</p>
    </div>`;
  });
  sc.innerHTML = html;

  // highlights
  byId("d-highlights").innerHTML = d.highlights
    .map((h) => `<li>${h}</li>`)
    .join("");

  // more projects
  const more = d.more
    .map((s) => window.DATA.projects.find((p) => p.slug === s))
    .filter(Boolean);
  byId("d-more").innerHTML = window.renderCards
    ? window.renderCards(more)
    : "";
});
