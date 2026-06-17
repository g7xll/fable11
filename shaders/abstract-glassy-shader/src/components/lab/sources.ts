// Real file contents, imported verbatim so the on-page source always matches
// what's actually shipped (no hand-maintained copies to drift out of sync).
import componentSource from "@/components/ui/abstract-glassy-shader.tsx?raw";
import demoSource from "@/components/ui/demo.tsx?raw";

export { componentSource, demoSource };

export const usageSource = `import { ShaderComponent } from "@/components/ui/abstract-glassy-shader";

export default function Hero() {
  return (
    <div className="relative h-screen w-full bg-black">
      <ShaderComponent />
    </div>
  );
}`;

export const tweakedUsageSource = `// Promote the baked-in constants to live props
<ShaderComponent
  settings={{ palette: "glass", merge: 0.28, glow: 8, speed: 0.8 }}
  onFrame={(s) => (fpsRef.current = s.fps)}
/>`;

export const componentsJson = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}`;

export const setupSource = `# 1 — scaffold a Vite + React + TypeScript app
npm create vite@latest my-app -- --template react-ts
cd my-app

# 2 — add Tailwind CSS v4 (Vite plugin)
npm i -D tailwindcss @tailwindcss/vite
#   • add tailwindcss() to vite.config.ts plugins
#   • add  @import "tailwindcss";  to src/index.css

# 3 — initialise shadcn/ui (writes components.json + the "@" alias)
npx shadcn@latest init

# 4 — drop the component in, then import it
#   src/components/ui/abstract-glassy-shader.tsx`;
