import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
