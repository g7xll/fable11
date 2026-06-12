/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	preview: {
		port: 4723,
		strictPort: true,
	},
	test: {
		environment: "jsdom",
		globals: true,
	},
});
