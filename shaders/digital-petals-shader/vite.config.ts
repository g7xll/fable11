import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// shadcn convention: "@" resolves to ./src so imports like
// "@/components/ui/digital-petals-shader" resolve exactly as the brief expects.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
