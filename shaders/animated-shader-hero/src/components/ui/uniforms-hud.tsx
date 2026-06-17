import { Activity, Move3d, MousePointer2 } from "lucide-react";

export interface UniformState {
  time: number;
  width: number;
  height: number;
  pointerCount: number;
  fps: number;
}

/**
 * Live telemetry overlay for the hero shader. This is the page's signature
 * element: instead of a generic stat block, it reports the actual uniforms the
 * fragment shader receives every frame — proving the background is a live WebGL
 * program, not a video, and that it responds to the pointer.
 */
export function UniformsHud({ state }: { state: UniformState }) {
  const rows: { label: string; value: string; glsl: string }[] = [
    { label: "time", value: `${state.time.toFixed(2)}s`, glsl: "uniform float" },
    {
      label: "resolution",
      value: `${state.width}×${state.height}`,
      glsl: "uniform vec2",
    },
    {
      label: "pointerCount",
      value: String(state.pointerCount),
      glsl: "uniform int",
    },
  ];

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-20 hidden w-[248px] select-none sm:block">
      <div className="rounded-xl border border-gold/15 bg-void-900/70 p-3 font-mono text-[11px] leading-none text-paper/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ember">
            <span className="hud-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ember" />
            shader.frag
          </span>
          <span className="flex items-center gap-1 text-ash">
            <Activity className="h-3 w-3" />
            {state.fps || "··"} fps
          </span>
        </div>

        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-baseline justify-between gap-3">
              <span className="text-ash">
                <span className="text-gold/40">{r.glsl} </span>
                {r.label}
              </span>
              <span className="tabular-nums text-paper">{r.value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-1.5 border-t border-white/5 pt-2 text-[10px] text-ash">
          {state.pointerCount > 0 ? (
            <>
              <Move3d className="h-3 w-3 text-ember" />
              <span className="text-ember">disturbing the field…</span>
            </>
          ) : (
            <>
              <MousePointer2 className="h-3 w-3" />
              <span>drag the canvas to disturb it</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
