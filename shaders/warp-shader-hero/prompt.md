# WARP SHADER HERO

YOU ARE GIVEN A TASK TO INTEGRATE AN EXISTING REACT COMPONENT IN THE CODEBASE

THE CODEBASE SHOULD SUPPORT:

- SHADCN PROJECT STRUCTURE
- TAILWIND CSS
- TYPESCRIPT

IF IT DOESN'T, PROVIDE INSTRUCTIONS ON HOW TO SETUP PROJECT VIA SHADCN CLI, INSTALL TAILWIND OR TYPESCRIPT.

DETERMINE THE DEFAULT PATH FOR COMPONENTS AND STYLES.
IF DEFAULT PATH FOR COMPONENTS IS NOT /COMPONENTS/UI, PROVIDE INSTRUCTIONS ON WHY IT'S IMPORTANT TO CREATE THIS FOLDER
COPY-PASTE THIS COMPONENT TO /COMPONENTS/UI FOLDER:

```tsx
wrap-shader.tsx
import { Warp } from "@paper-design/shaders-react"

export default function WarpShaderHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["hsl(200, 100%, 20%)", "hsl(160, 100%, 75%)", "hsl(180, 90%, 30%)", "hsl(170, 100%, 80%)"]}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-white text-5xl md:text-7xl font-sans font-light text-balance">
            Elegant Shader Backgrounds
          </h1>

          <p className="text-white/90 text-xl md:text-2xl font-sans font-light leading-relaxed max-w-3xl mx-auto">
            Beautiful, performant shader effects that enhance your content without overwhelming it. Perfect for hero
            sections, landing pages, and modern web experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white rounded-full text-gray-800 font-medium hover:scale-105 transition-transform duration-300">
              View Examples
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}


demo.tsx
import WarpShaderHero from "@/components/ui/wrap-shader";

export default function DemoOne() {
  return (
    <div className= "min-h-screen h-full w-full" >
    <WarpShaderHero/>
    < /div>
  );
}
```

INSTALL NPM DEPENDENCIES:

```bash
@paper-design/shaders-react
```

IMPLEMENTATION GUIDELINES

1. ANALYZE THE COMPONENT STRUCTURE AND IDENTIFY ALL REQUIRED DEPENDENCIES
2. REVIEW THE COMPONENT'S ARGUMENS AND STATE
3. IDENTIFY ANY REQUIRED CONTEXT PROVIDERS OR HOOKS AND INSTALL THEM
4. QUESTIONS TO ASK

- WHAT DATA/PROPS WILL BE PASSED TO THIS COMPONENT?
- ARE THERE ANY SPECIFIC STATE MANAGEMENT REQUIREMENTS?
- ARE THERE ANY REQUIRED ASSETS (IMAGES, ICONS, ETC.)?
- WHAT IS THE EXPECTED RESPONSIVE BEHAVIOR?
- WHAT IS THE BEST PLACE TO USE THIS COMPONENT IN THE APP?

STEPS TO INTEGRATE

0. COPY PASTE ALL THE CODE ABOVE IN THE CORRECT DIRECTORIES
1. INSTALL EXTERNAL DEPENDENCIES
2. FILL IMAGE ASSETS WITH UNSPLASH STOCK IMAGES YOU KNOW EXIST
3. USE LUCIDE-REACT ICONS FOR SVGS OR LOGOS IF COMPONENT REQUIRES THEM
