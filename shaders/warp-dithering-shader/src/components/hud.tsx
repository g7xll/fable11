import type { ReactNode } from "react";
import { Activity, Clock, Cpu, Grid3x3, Maximize2, Waves } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { SHAPES, TYPES } from "@/lib/shader-meta";
import type { LiveParams, Size } from "@/lib/shader-meta";

function Readout({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 border border-border/70 bg-ink/70 px-2.5 py-1.5 backdrop-blur-sm">
      <span className="text-amber/80">{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-[8px] uppercase tracking-widest2 text-ash">
          {label}
        </span>
        <span className="mt-0.5 font-mono text-[11px] tabular-nums text-bone">
          {value}
        </span>
      </div>
    </div>
  );
}

/** The live telemetry strip floating in the hero's top-right. */
export function Hud({ params, size }: { params: LiveParams; size: Size }) {
  const { fps, elapsed } = useTelemetry();
  const shape = SHAPES.find((s) => s.id === params.shape)?.label ?? params.shape;
  const dither = TYPES.find((t) => t.id === params.type)?.label ?? params.type;
  const icon = "h-3.5 w-3.5";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Readout icon={<Waves className={icon} />} label="Shape" value={shape} />
      <Readout icon={<Grid3x3 className={icon} />} label="Dither" value={dither} />
      <Readout
        icon={<Maximize2 className={icon} />}
        label="Res"
        value={size.width ? `${size.width}×${size.height}` : "—"}
      />
      <Readout
        icon={<Cpu className={icon} />}
        label="px"
        value={params.pxSize.toFixed(0)}
      />
      <Readout
        icon={<Activity className={icon} />}
        label="fps"
        value={fps ? String(fps) : "—"}
      />
      <Readout
        icon={<Clock className={icon} />}
        label="clk"
        value={`${elapsed.toFixed(1)}s`}
      />
    </div>
  );
}
