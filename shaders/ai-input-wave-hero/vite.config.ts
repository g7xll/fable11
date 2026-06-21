import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// shadcn-style "@/..." alias resolves to ./src so the verbatim component can be
// imported exactly as written in the prompt:
//   "@/components/ui/ai-input-hero" and "@/components/ui/mini-navbar".
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
