import CelestialMatrixShader from "@/components/ui/martrix-shader";

/**
 * DemoOne — the brief's reference usage, verbatim in spirit: the shader as a
 * fixed full-viewport background with a centered title/description overlay.
 *
 * The full experiment in `App.tsx` builds the relay-terminal scene on top of
 * the same component; this file is kept as the minimal, copy-paste integration
 * the brief asks for.
 */
export default function DemoOne() {
  return (
    <div className="relative grid h-screen w-screen place-items-center">
      <CelestialMatrixShader />
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-white">
          Celestial Matrix
        </h1>
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.4em] text-mist">
          An Interactive WebGL Shader
        </p>
      </div>
    </div>
  );
}
