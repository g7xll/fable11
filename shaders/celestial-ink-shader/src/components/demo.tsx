import CelestialInkShader from "@/components/ui/celestial-ink-shader";

/**
 * The integration brief's `demo.tsx`, preserved verbatim in intent: the shader
 * as a fixed full-viewport background with a centred title lockup on top.
 *
 * The richer instrument framing lives in `App.tsx`; this file documents the
 * minimal drop-in usage the brief asked for. Class names map to the small block
 * of styles in `index.css` (`.app-container`, `.overlay-content`, ...).
 */
export default function DemoOne() {
  return (
    <div className="app-container">
      <CelestialInkShader />
      <div className="overlay-content">
        <h1 className="title">Celestial Ink</h1>
        <p className="description">An Interactive WebGL Shader</p>
      </div>
    </div>
  );
}
