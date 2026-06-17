# EXPANDABLE HERO BUTTON COMPONENT INTEGRATION

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
hero-button-expendable.tsx
"use client"

import { useState, useEffect } from "react"
import { X, Check, ArrowRight, BarChart3, Globe2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"

export default function Hero() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formStep, setFormStep] = useState<"idle" | "submitting" | "success">("idle")

  const handleExpand = () => setIsExpanded(true)
  
  const handleClose = () => {
    setIsExpanded(false)
    // Reset form after a brief delay so the user doesn't see it reset while closing
    setTimeout(() => setFormStep("idle"), 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStep("submitting")
    // Simulate API call
    setTimeout(() => {
      setFormStep("success")
    }, 1500)
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isExpanded])

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 px-4 sm:px-6 py-12 sm:py-20 transition-colors duration-300">
        
        {/* GodRays Background - Adjusted to be subtle in both modes */}
        <div className="absolute inset-0 pointer-events-none">
          <GodRays
            colorBack="#00000000"
            // Using slightly transparent grays/whites to work on both dark/light backgrounds
            colors={["#a1a1aa40", "#e4e4e740", "#71717a40", "#52525b40"]}
            colorBloom="#a1a1aa"
            offsetX={0.85}
            offsetY={-1}
            intensity={0.5}
            spotty={0.45}
            midSize={10}
            midIntensity={0}
            density={0.38}
            bloom={0.3}
            speed={0.5}
            scale={1.6}
            frame={3332042.8159981333}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            New: Q3 Enterprise Report
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl"
          >
            Orchestrate your entire <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              revenue engine
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl px-4 leading-relaxed"
          >
            Stop wrestling with disconnected tools. Nexus provides the infrastructure to build, 
            measure, and scale your digital products with enterprise-grade security.
          </motion.p>

          <AnimatePresence initial={false}>
            {!isExpanded && (
              <motion.div className="inline-block relative mt-4">
                {/* The expanding background element */}
                <motion.div
                  style={{ borderRadius: "100px" }}
                  layout
                  layoutId="cta-card"
                  className="absolute inset-0 bg-blue-600 dark:bg-blue-600"
                />
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout={false}
                  onClick={handleExpand}
                  className="relative flex items-center gap-2 h-14 px-8 py-3 text-lg font-medium text-white tracking-wide hover:opacity-90 transition-opacity"
                >
                  Start your journey
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 
        Expanded Modal Overlay 
      */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <motion.div
              layoutId="cta-card"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-blue-700 sm:rounded-[24px] shadow-2xl"
            >
              {/* Mesh Gradient Background inside Modal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                <MeshGradient
                  speed={0.6}
                  colors={["#1d4ed8", "#1e40af", "#172554", "#1e3a8a"]} // Blue palette
                  distortion={0.8}
                  swirl={0.1}
                  grainMixer={0.15}
                  grainOverlay={0}
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-8 sm:top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto overflow-y-auto lg:overflow-hidden"
              >
                {/* Left Side: Testimonials & Info */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 gap-8 text-white">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                      Ready to scale?
                    </h2>
                    <p className="text-blue-100 text-lg max-w-md">
                      Join 4,000+ forward-thinking companies building the future with Nexus.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <BarChart3 className="w-6 h-6 text-blue-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Analytics First</h3>
                        <p className="text-blue-100/80 text-sm leading-relaxed mt-1">
                          Real-time insights embedded directly into your deployment workflow.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Globe2 className="w-6 h-6 text-blue-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Global Edge</h3>
                        <p className="text-blue-100/80 text-sm leading-relaxed mt-1">
                          Deploy to 35+ regions instantly with our automated edge network.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/20">
                    <figure>
                      <blockquote className="text-xl font-medium leading-relaxed mb-6">
                        "Nexus transformed how we ship software. We went from weekly releases to daily deployments with zero downtime."
                      </blockquote>
                      <figcaption className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-lg font-bold text-white">
                          ER
                        </div>
                        <div>
                          <div className="font-semibold">Elena Rodriguez</div>
                          <div className="text-sm text-blue-200">VP of Engineering, Chrono</div>
                        </div>
                      </figcaption>
                    </figure>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-16 bg-black/10 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                  <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    
                    {formStep === "success" ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center h-[400px] space-y-6"
                      >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                          <Check className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                          <p className="text-blue-100">Our team will be in touch shortly to schedule your personalized demo.</p>
                        </div>
                        <button 
                          onClick={handleClose}
                          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Return to Homepage
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-white">Get a Demo</h3>
                          <p className="text-sm text-blue-200">Fill out the form below and we'll contact you.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-xs font-medium text-blue-200 mb-1.5 uppercase tracking-wider">
                              Full Name
                            </label>
                            <input
                              required
                              type="text"
                              id="name"
                              placeholder="Jane Doe"
                              className="w-full px-4 py-3 rounded-lg bg-blue-950/40 border border-blue-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-xs font-medium text-blue-200 mb-1.5 uppercase tracking-wider">
                              Work Email
                            </label>
                            <input
                              required
                              type="email"
                              id="email"
                              placeholder="jane@company.com"
                              className="w-full px-4 py-3 rounded-lg bg-blue-950/40 border border-blue-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="company" className="block text-xs font-medium text-blue-200 mb-1.5 uppercase tracking-wider">
                                Company
                              </label>
                              <input
                                type="text"
                                id="company"
                                placeholder="Acme Inc"
                                className="w-full px-4 py-3 rounded-lg bg-blue-950/40 border border-blue-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="size" className="block text-xs font-medium text-blue-200 mb-1.5 uppercase tracking-wider">
                                Size
                              </label>
                              <select
                                id="size"
                                className="w-full px-4 py-3 rounded-lg bg-blue-950/40 border border-blue-300/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option className="bg-blue-900">1-50</option>
                                <option className="bg-blue-900">51-200</option>
                                <option className="bg-blue-900">201-1000</option>
                                <option className="bg-blue-900">1000+</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-xs font-medium text-blue-200 mb-1.5 uppercase tracking-wider">
                              Needs
                            </label>
                            <textarea
                              id="message"
                              rows={3}
                              placeholder="Tell us about your project..."
                              className="w-full px-4 py-3 rounded-lg bg-blue-950/40 border border-blue-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none text-sm"
                            />
                          </div>
                        </div>

                        <button
                          disabled={formStep === "submitting"}
                          type="submit"
                          className="w-full flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                          {formStep === "submitting" ? (
                             <span className="flex items-center gap-2">
                               <span className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                               Sending...
                             </span>
                          ) : "Submit Request"}
                        </button>
                        
                        <p className="text-xs text-center text-blue-200/60 mt-4">
                          By submitting, you agree to our Terms of Service and Privacy Policy.
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

demo.tsx
import Hero from "@/components/ui/hero-button-expendable";

export default function DemoOne() {
  return (
    <div className="h-full w-full">
    <Hero/>
    </div>
  );
}

```

INSTALL NPM DEPENDENCIES:

```bash
lucide-react, framer-motion, @paper-design/shaders-react
```

EXTEND EXISTING TAILWIND 4 INDEX.CSS WITH THIS CODE (OR IF PROJECT USES TAILWIND 3, EXTEND TAILWIND.CONFIG.JS OR GLOBALS.CSS):

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-destructive-foreground: var(--destructive-foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

:root {
  --background: rgb(253, 251, 247);
  --foreground: rgb(74, 59, 51);
  --card: rgb(248, 244, 238);
  --card-foreground: rgb(74, 59, 51);
  --popover: rgb(248, 244, 238);
  --popover-foreground: rgb(74, 59, 51);
  --primary: rgb(180, 83, 9);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(228, 192, 144);
  --secondary-foreground: rgb(87, 83, 78);
  --muted: rgb(241, 233, 218);
  --muted-foreground: rgb(120, 113, 108);
  --accent: rgb(242, 218, 186);
  --accent-foreground: rgb(87, 83, 78);
  --destructive: rgb(153, 27, 27);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(228, 217, 188);
  --input: rgb(228, 217, 188);
  --ring: rgb(180, 83, 9);
  --chart-1: rgb(180, 83, 9);
  --chart-2: rgb(120, 113, 108);
  --chart-3: rgb(161, 98, 7);
  --chart-4: rgb(120, 113, 108);
  --chart-5: rgb(202, 138, 4);
  --sidebar: rgb(241, 233, 218);
  --sidebar-foreground: rgb(74, 59, 51);
  --sidebar-primary: rgb(180, 83, 9);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(161, 98, 7);
  --sidebar-accent-foreground: rgb(255, 255, 255);
  --sidebar-border: rgb(228, 217, 188);
  --sidebar-ring: rgb(180, 83, 9);
  --font-sans: Oxanium, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: Fira Code, monospace;
  --radius: 0.3rem;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(28 18% 25%);
  --shadow-2xs: 0px 2px 3px 0px hsl(28 18% 25% / 0.09);
  --shadow-xs: 0px 2px 3px 0px hsl(28 18% 25% / 0.09);
  --shadow-sm: 0px 2px 3px 0px hsl(28 18% 25% / 0.18), 0px 1px 2px -1px hsl(28 18% 25% / 0.18);
  --shadow: 0px 2px 3px 0px hsl(28 18% 25% / 0.18), 0px 1px 2px -1px hsl(28 18% 25% / 0.18);
  --shadow-md: 0px 2px 3px 0px hsl(28 18% 25% / 0.18), 0px 2px 4px -1px hsl(28 18% 25% / 0.18);
  --shadow-lg: 0px 2px 3px 0px hsl(28 18% 25% / 0.18), 0px 4px 6px -1px hsl(28 18% 25% / 0.18);
  --shadow-xl: 0px 2px 3px 0px hsl(28 18% 25% / 0.18), 0px 8px 10px -1px hsl(28 18% 25% / 0.18);
  --shadow-2xl: 0px 2px 3px 0px hsl(28 18% 25% / 0.45);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: rgb(28, 25, 23);
  --foreground: rgb(245, 245, 244);
  --card: rgb(41, 37, 36);
  --card-foreground: rgb(245, 245, 244);
  --popover: rgb(41, 37, 36);
  --popover-foreground: rgb(245, 245, 244);
  --primary: rgb(249, 115, 22);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(87, 83, 78);
  --secondary-foreground: rgb(231, 229, 228);
  --muted: rgb(32, 29, 26);
  --muted-foreground: rgb(168, 162, 158);
  --accent: rgb(30, 66, 82);
  --accent-foreground: rgb(231, 229, 228);
  --destructive: rgb(220, 38, 38);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(68, 64, 60);
  --input: rgb(68, 64, 60);
  --ring: rgb(249, 115, 22);
  --chart-1: rgb(249, 115, 22);
  --chart-2: rgb(14, 165, 233);
  --chart-3: rgb(234, 179, 8);
  --chart-4: rgb(168, 162, 158);
  --chart-5: rgb(120, 113, 108);
  --sidebar: rgb(41, 37, 36);
  --sidebar-foreground: rgb(245, 245, 244);
  --sidebar-primary: rgb(249, 115, 22);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(14, 165, 233);
  --sidebar-accent-foreground: rgb(12, 42, 77);
  --sidebar-border: rgb(68, 64, 60);
  --sidebar-ring: rgb(249, 115, 22);
  --font-sans: Oxanium, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: Fira Code, monospace;
  --radius: 0.3rem;
  --shadow-x: 0px;
  --shadow-y: 2px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(0 0% 5%);
  --shadow-2xs: 0px 2px 3px 0px hsl(0 0% 5% / 0.09);
  --shadow-xs: 0px 2px 3px 0px hsl(0 0% 5% / 0.09);
  --shadow-sm: 0px 2px 3px 0px hsl(0 0% 5% / 0.18), 0px 1px 2px -1px hsl(0 0% 5% / 0.18);
  --shadow: 0px 2px 3px 0px hsl(0 0% 5% / 0.18), 0px 1px 2px -1px hsl(0 0% 5% / 0.18);
  --shadow-md: 0px 2px 3px 0px hsl(0 0% 5% / 0.18), 0px 2px 4px -1px hsl(0 0% 5% / 0.18);
  --shadow-lg: 0px 2px 3px 0px hsl(0 0% 5% / 0.18), 0px 4px 6px -1px hsl(0 0% 5% / 0.18);
  --shadow-xl: 0px 2px 3px 0px hsl(0 0% 5% / 0.18), 0px 8px 10px -1px hsl(0 0% 5% / 0.18);
  --shadow-2xl: 0px 2px 3px 0px hsl(0 0% 5% / 0.45);
}

```

## IMPLEMENTATION GUIDELINES

1. ANALYZE THE COMPONENT STRUCTURE AND IDENTIFY ALL REQUIRED DEPENDENCIES
2. REVIEW THE COMPONENT'S ARGUMENS AND STATE
3. IDENTIFY ANY REQUIRED CONTEXT PROVIDERS OR HOOKS AND INSTALL THEM
4. QUESTIONS TO ASK
   - WHAT DATA/PROPS WILL BE PASSED TO THIS COMPONENT?
   - ARE THERE ANY SPECIFIC STATE MANAGEMENT REQUIREMENTS?
   - ARE THERE ANY REQUIRED ASSETS (IMAGES, ICONS, ETC.)?
   - WHAT IS THE EXPECTED RESPONSIVE BEHAVIOR?
   - WHAT IS THE BEST PLACE TO USE THIS COMPONENT IN THE APP?

## STEPS TO INTEGRATE

0. COPY PASTE ALL THE CODE ABOVE IN THE CORRECT DIRECTORIES
1. INSTALL EXTERNAL DEPENDENCIES
2. FILL IMAGE ASSETS WITH UNSPLASH STOCK IMAGES YOU KNOW EXIST
3. USE LUCIDE-REACT ICONS FOR SVGS OR LOGOS IF COMPONENT REQUIRES THEM
