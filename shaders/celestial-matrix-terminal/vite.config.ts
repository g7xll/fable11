import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// shadcn convention: "@" resolves to ./src so the component import in the brief
// — `@/components/ui/martrix-shader` — works exactly as written.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
