import AuroraBorealisShader from "@/components/ui/aurora-borealis-shader";

/**
 * DemoOne — the minimal integration straight from the brief. This is the exact
 * usage the component ships with: the fixed aurora background plus a centered
 * overlay. The fuller "Aurora Watch" console lives in `App.tsx`; this file is
 * kept so the canonical drop-in example from the prompt stays runnable on its own.
 */
export default function DemoOne() {
  return (
    <div className="app-container">
      <AuroraBorealisShader />
      <div className="overlay-content">
        <h1 className="title">Aurora Borealis</h1>
        <p className="description">An Interactive WebGL Shader</p>
      </div>
    </div>
  );
}
