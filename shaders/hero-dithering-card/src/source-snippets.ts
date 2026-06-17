// Source strings shown verbatim in the integration + source panels. Kept in
// sync with the real files under src/components/ui so the page documents itself.

export const COMPONENT_SOURCE = `import { ArrowRight } from "lucide-react"
import { useState, Suspense, lazy } from "react"

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
)

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="py-12 w-full flex justify-center items-center px-4 md:px-6">
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[48px] border border-border bg-card shadow-sm min-h-[600px] ...">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#EC4E02"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>
          {/* headline · description · CTA button (z-10) */}
        </div>
      </div>
    </section>
  )
}`;

export const DEMO_SOURCE = `import { CTASection } from "@/components/ui/hero-dithering-card";

export default function DemoOne() {
  return <CTASection />;
}`;

export const INSTALL_SOURCE = `# the shader runtime + the icon set the card uses
npm install @paper-design/shaders-react lucide-react`;

export const USAGE_SOURCE = `import { CTASection } from "@/components/ui/hero-dithering-card";

export default function Page() {
  return (
    <main>
      {/* drop it anywhere — it sizes to a full-width section */}
      <CTASection />
    </main>
  );
}`;

export const TREE_SOURCE = `src/
└─ components/
   └─ ui/
      ├─ hero-dithering-card.tsx   ← the card (drop it here)
      └─ demo.tsx                  ← imports it from @/components/ui`;
