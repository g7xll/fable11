import DigitalPetalsShader from "@/components/ui/digital-petals-shader";

/**
 * DemoOne — the minimal integration straight from the brief. This is the exact
 * drop-in usage the component ships with: a fixed full-viewport shader behind a
 * centered overlay. The richer "specimen plate" experience lives in `App.tsx`;
 * this file is kept so the canonical example from the prompt stays runnable on
 * its own (the `.app-container` / `.overlay-content` styles are in index.css).
 */
export default function DemoOne() {
  return (
    <div className="app-container">
      <DigitalPetalsShader />
      <div className="overlay-content">
        <h1 className="title">Digital Petals</h1>
        <p className="description">An Interactive WebGL Shader</p>
      </div>
    </div>
  );
}
