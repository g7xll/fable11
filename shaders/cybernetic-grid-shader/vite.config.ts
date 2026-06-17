import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// shadcn convention: "@" resolves to ./src so the component import
// "@/components/ui/cybernetic-grid-shader" works exactly as the brief expects.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
