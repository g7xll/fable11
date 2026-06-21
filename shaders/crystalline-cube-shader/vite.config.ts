import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// shadcn convention: "@" resolves to ./src so the component's own import,
// `import InteractiveShader from "@/components/ui/crystalline-cube"`, works
// exactly as written in the prompt.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
