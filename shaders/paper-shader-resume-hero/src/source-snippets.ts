/**
 * Verbatim source of the integrated artifact, embedded as strings so the
 * showcase can render copyable source panels without a build-time loader.
 * These mirror the files in src/components/ui/ (the component carries one
 * documented integration fix — shape="cat" → shape="sphere" — flagged inline).
 */

export const COMPONENT_SOURCE = String.raw`"use client"

import { Dithering } from "@paper-design/shaders-react"
import { useState } from "react"

export default function ResumePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <div className="relative min-h-screen overflow-hidden flex">
      <div
        className={\`w-1/2 p-8 font-mono relative z-10 \${isDarkMode ? "bg-black text-white" : "bg-white text-black"}\`}
      >
        {/* Theme toggle button in top right of left panel */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={\`absolute top-8 right-8 p-2 rounded-full transition-colors \${
            isDarkMode ? "hover:bg-white/10" : "hover:bg-black/10"
          }\`}
          aria-label="Toggle theme"
        >
          {/* Sun / Moon icon … */}
        </button>

        <div className="mb-12">
          <h1 className="text-lg font-normal mb-8">Jessi.cv</h1>
          <div className="mb-8">
            <h2 className="text-lg font-normal">JESSI REDACTED</h2>
            <h3 className="text-lg font-normal">DESIGNER</h3>
          </div>
        </div>

        {/* Experience rows … */}

        <div className="absolute bottom-8 left-8">
          <div className="flex space-x-4 text-lg font-mono">
            <span>Links</span><span>Twitter</span><span>Email</span><span>Blog</span>
          </div>
        </div>
      </div>

      <div className="w-1/2 relative">
        <Dithering
          style={{ height: "100%", width: "100%" }}
          colorBack={isDarkMode ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 95%)"}
          colorFront={isDarkMode ? "hsl(320, 100%, 70%)" : "hsl(220, 100%, 70%)"}
          shape="sphere"   /* fix: "cat" is not a valid DitheringShape */
          type="4x4"
          pxSize={3}
          offsetX={0}
          offsetY={0}
          scale={0.8}
          rotation={0}
          speed={0.1}
        />
      </div>
    </div>
  )
}`;

export const DEMO_SOURCE = String.raw`import ResumePage from "@/components/ui/portfolio-hero-with-paper-shaders";

export default function DemoOne() {
  return (
    <div className="min-h-screen h-full w-full">
      <ResumePage />
    </div>
  );
}`;

export const INSTALL_SOURCE = String.raw`# 1 · scaffold a shadcn-ready Vite + React + TypeScript app
npm create vite@latest my-app -- --template react-ts
cd my-app

# 2 · Tailwind CSS v4 (the @tailwindcss/vite plugin)
npm install -D tailwindcss @tailwindcss/vite
#   → add the plugin in vite.config.ts and \`@import "tailwindcss";\` in your CSS

# 3 · wire the "@/*" alias (tsconfig paths + vite resolve.alias)
#   so "@/components/ui/…" resolves to ./src/components/ui/…

# 4 · init shadcn — this creates components.json and the components/ui folder
npx shadcn@latest init

# 5 · the component's one external dependency
npm install @paper-design/shaders-react

# 6 · drop the files into the shadcn-default UI directory
#   src/components/ui/portfolio-hero-with-paper-shaders.tsx
#   src/components/ui/demo.tsx`;
