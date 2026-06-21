import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Path alias mirrors the shadcn convention: `@/*` -> `src/*`,
// so `@/components/ui/...` and `@/lib/...` imports resolve correctly.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
