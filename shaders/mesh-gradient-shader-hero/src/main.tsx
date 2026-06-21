import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import satoshiWoff2 from "../assets/fonts/Onest-Variable.woff2?url";
import App from "./App.tsx";

/*
 * Load the vendored "Satoshi" face (Onest, OFL) via the JS FontFace API instead
 * of a CSS @font-face. Two reasons:
 *   1. The component requests `fontFamily: "Satoshi, …"`; registering the face
 *      under that family name makes it resolve locally with no remote calls and
 *      no edit to the verbatim component.
 *   2. A CSS @font-face leaves headless Chromium's `document.fonts.ready`
 *      promise stuck in "loading" on a continuously-animating (rAF/WebGL) page,
 *      which hangs the demo recorder / any headless check. Adding an already
 *      *loaded* FontFace via document.fonts.add() avoids that entirely. The woff2
 *      is bundled by Vite (imported with ?url), so the app is fully self-contained.
 */
async function loadSatoshi() {
	if (typeof document === "undefined" || !("fonts" in document)) return;
	try {
		const face = new FontFace(
			"Satoshi",
			`url(${satoshiWoff2}) format("woff2")`,
			{
				weight: "100 900",
				style: "normal",
				display: "swap",
			},
		);
		await face.load();
		document.fonts.add(face);
	} catch {
		/* fall back to the system sans in the font stack */
	}
}
void loadSatoshi();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
