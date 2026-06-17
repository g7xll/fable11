import CyberneticGridShader from "@/components/ui/cybernetic-grid-shader";

/**
 * DemoOne — the minimal integration from the brief. This is the exact usage the
 * component ships with: the fixed shader background plus a centered overlay.
 *
 * The fuller instrument experience lives in `App.tsx`; this file is preserved so
 * the canonical drop-in example from the prompt stays runnable on its own.
 */
export default function DemoOne() {
  return (
    <div className="app-container">
      <CyberneticGridShader />
      <div className="overlay-content">
        <h1 className="title">Cybernetic Grid</h1>
        <p className="description">An Interactive WebGL Shader</p>
      </div>
    </div>
  );
}
