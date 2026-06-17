/* Source strings shown in the integration section's copyable code blocks. */

export const SCAFFOLD_SRC = `# 1 - Vite + React + TypeScript
npm create vite@latest aperture -- --template react-ts
cd aperture

# 2 - Tailwind CSS v4 (+ the small utility deps the showcase uses)
npm install tailwindcss @tailwindcss/vite tw-animate-css
npm install clsx tailwind-merge lucide-react

# 3 - shadcn structure: components.json + the @/ alias + src/lib/utils.ts
npx shadcn@latest init

# 4 - drop the component into the default UI path
#     src/components/ui/raidal-2.tsx`;

export const DEMO_SRC = `// src/components/ui/demo.tsx  — verbatim from the brief
import Component from "@/components/ui/raidal-2";

export default function DemoOne() {
  return <Component />;
}`;

export const USAGE_SRC = `// A) Full-screen drop-in, exactly as delivered (position: fixed; inset: 0)
import Component from "@/components/ui/raidal-2";
export default () => <Component />;

// B) Embed the SAME shader inside any positioned box — the canvas is
//    absolute inset-0, so give the parent \`relative\` and a height:
import { ShaderCanvas, SHADER_SRC } from "@/components/ui/raidal-2";

<div className="relative h-[480px] overflow-hidden rounded-xl bg-black">
  <ShaderCanvas fragSource={SHADER_SRC} />
</div>`;

export const TAILWIND_SRC = `/* src/index.css */
@import "tailwindcss";

/* The drop-in itself needs no Tailwind — it ships inline styles and raw
   WebGL2. Tailwind only styles the surrounding instrument UI. */`;
