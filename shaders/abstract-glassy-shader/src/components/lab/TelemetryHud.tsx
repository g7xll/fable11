import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Activity } from "lucide-react";
import type { ShaderSettings, ShaderStats } from "@/components/ui/abstract-glassy-shader";

const PALETTE_LABEL: Record<ShaderSettings["palette"], string> = {
  spectrum: "SPECTRUM",
  glass: "GLASS",
  ember: "EMBER",
};

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[5px]">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          "font-mono text-[11.5px] tabular-nums " + (accent ? "text-accent" : "text-foreground/90")
        }
      >
        {value}
      </span>
    </div>
  );
}

const vec = (v: [number, number]) => `${v[0] >= 0 ? " " : ""}${v[0].toFixed(2)}, ${v[1] >= 0 ? " " : ""}${v[1].toFixed(2)}`;

export function TelemetryHud({
  statsRef,
  settings,
}: {
  statsRef: MutableRefObject<ShaderStats>;
  settings: ShaderSettings;
}) {
  const [stats, setStats] = useState<ShaderStats>(statsRef.current);
  const samples = useRef<number[]>([]);
  const [spark, setSpark] = useState<number[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const s = statsRef.current;
      setStats({ ...s });
      const buf = samples.current;
      buf.push(s.fps);
      if (buf.length > 44) buf.shift();
      setSpark([...buf]);
    }, 110);
    return () => window.clearInterval(id);
  }, [statsRef]);

  // FPS sparkline path (0–70 fps mapped into a 100x26 viewbox).
  const path = spark
    .map((f, i) => {
      const x = (i / Math.max(1, spark.length - 1)) * 100;
      const y = 26 - Math.min(1, f / 70) * 24 - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="glass w-[230px] rounded-2xl p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
            Telemetry
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {settings.paused ? "Frozen" : "Live"}
          </span>
        </span>
      </div>

      <div className="mb-2.5 overflow-hidden rounded-lg border border-border bg-black/30 px-2.5 pb-1.5 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            FPS
          </span>
          <span className="font-mono text-[13px] tabular-nums text-foreground">
            {stats.fps.toFixed(0)}
          </span>
        </div>
        <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="mt-1 h-6 w-full">
          <path d={path} fill="none" stroke="url(#tg)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3fe1ff" />
              <stop offset="1" stopColor="#c46bff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="divide-y divide-border/60">
        <Row label="Clock" value={`${stats.time.toFixed(2)} s`} accent />
        <Row label="Buffer" value={`${stats.width}×${stats.height}`} />
        <Row label="Blob A" value={vec(stats.blobA)} />
        <Row label="Blob B" value={vec(stats.blobB)} />
        <Row label="Merge k" value={settings.merge.toFixed(2)} />
        <Row label="Palette" value={PALETTE_LABEL[settings.palette]} accent />
      </div>
    </div>
  );
}
