import type { WarpDriveFrame } from "@/components/ui/warp-drive-shader";

/**
 * Helm telemetry + warp-speed control. The readouts are the verbatim shader
 * uniforms (`iTime`, `iMouse`, `iResolution`) surfaced as flight data; the
 * faders drive the one host-side knob, `warpSpeed`, which rescales the shader
 * clock without touching the GLSL.
 */

function Readout({
  label,
  value,
  unit,
  accent = "text-frost",
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-haze">
        {label}
      </span>
      <span className={`font-mono text-[13px] tabular-nums ${accent}`}>
        {value}
        {unit ? <span className="ml-1 text-[9px] text-haze">{unit}</span> : null}
      </span>
    </div>
  );
}

const WARP_PRESETS = [
  { label: "ALL STOP", value: 0 },
  { label: "IMPULSE", value: 0.4 },
  { label: "WARP 1", value: 1 },
  { label: "WARP 5", value: 2.4 },
  { label: "MAXIMUM", value: 4 },
];

export function HelmConsole({
  frame,
  warpSpeed,
  onWarpSpeed,
}: {
  frame: WarpDriveFrame;
  warpSpeed: number;
  onWarpSpeed: (v: number) => void;
}) {
  const fps = Math.round(frame.fps);
  const mx = Math.round(frame.mouse.x);
  const my = Math.round(frame.mouse.y);
  const w = Math.round(frame.size.width);
  const h = Math.round(frame.size.height);
  const fpsAccent = fps >= 50 ? "text-helm" : fps >= 30 ? "text-warp" : "text-alert";

  return (
    <div className="w-full rounded-md border border-helm/15 bg-void-900/70 backdrop-blur-md">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-helm/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-helm" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-frost/80">
            Helm · Drive Telemetry
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-haze">LIVE</span>
      </div>

      {/* Readout grid — straight off the shader uniforms */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-4">
        <Readout label="iTime" value={frame.time.toFixed(2)} unit="s" accent="text-warp" />
        <Readout label="Render" value={String(fps)} unit="fps" accent={fpsAccent} />
        <Readout label="iMouse" value={`${mx}, ${my}`} accent="text-helm" />
        <Readout label="iResolution" value={`${w}×${h}`} accent="text-frost" />
      </div>

      {/* Warp throttle */}
      <div className="border-t border-helm/10 px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-haze">
            warpSpeed prop
          </span>
          <span className="font-mono text-[11px] tabular-nums text-warp">
            ×{warpSpeed.toFixed(2)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={4}
          step={0.05}
          value={warpSpeed}
          onChange={(e) => onWarpSpeed(Number(e.target.value))}
          aria-label="Warp speed"
          className="warp-fader h-1.5 w-full cursor-pointer appearance-none rounded-full bg-void-600 accent-helm"
          style={{
            background: `linear-gradient(to right, #38e1ff 0%, #ffc24b ${(warpSpeed / 4) * 100}%, #1a2336 ${(warpSpeed / 4) * 100}%)`,
          }}
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {WARP_PRESETS.map((p) => {
            const active = Math.abs(warpSpeed - p.value) < 0.06;
            return (
              <button
                key={p.label}
                onClick={() => onWarpSpeed(p.value)}
                className={`rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "border-helm/60 bg-helm/15 text-helm"
                    : "border-helm/15 text-haze hover:border-helm/40 hover:text-frost"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
