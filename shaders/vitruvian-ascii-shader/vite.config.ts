import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// shadcn-style "@/" path alias resolves to ./src, so the demo can import from
// "@/components/ui/hero-ascii" exactly as the prompt's demo.tsx does.
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(dirname, "src"),
		},
	},
});
