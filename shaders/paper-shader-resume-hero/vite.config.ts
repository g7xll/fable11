import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// shadcn-style alias: "@/..." -> "./src/...". Mirrors the components.json
// `aliases` block so the verbatim `@/components/ui/portfolio-hero-with-paper-shaders`
// import in demo.tsx resolves exactly as it would in a real shadcn project.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
