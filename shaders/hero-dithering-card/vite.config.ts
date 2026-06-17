import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// shadcn-style alias: "@/..." -> "./src/...". Mirrors the components.json
// `aliases` block so the verbatim `@/components/ui/hero-dithering-card` import
// in demo.tsx resolves.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
