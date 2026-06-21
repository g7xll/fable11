import CelestialMatrixShader from "@/components/ui/martrix-shader";

/**
 * DemoOne — the minimal integration from the brief. This is the exact usage the
 * component ships with: the fixed shader background plus a centered overlay.
 *
 * The fuller `Console` experience lives in `App.tsx`; this file is preserved so
 * the canonical drop-in example from the prompt stays runnable on its own.
 */
export default function DemoOne() {
	return (
		<div className="app-container">
			<CelestialMatrixShader />
			<div className="overlay-content">
				<h1 className="title">Celestial Matrix</h1>
				<p className="description">An Interactive WebGL Shader</p>
			</div>
		</div>
	);
}
