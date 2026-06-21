import { Gauge, Radio, Waves, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { WaveMode } from "@/components/ui/flowing-waves-shader";
import { cn } from "@/lib/utils";

interface TideTelemetryProps {
	/** 0–1 luminance sampled from the rendered shader. */
	luminance: number;
	/** Normalized pointer position over the field (0–1, origin top-left). */
	pointer: { x: number; y: number };
	/** Current sea-state mode, for the station label + accent. */
	mode: WaveMode;
	className?: string;
}

const SPARK_POINTS = 48;

const MODE_META: Record<
	WaveMode,
	{ label: string; code: string; stroke: [string, string] }
> = {
	neutral: { label: "Calm", code: "S-00", stroke: ["#22384f", "#8aa6bb"] },
	active: {
		label: "Active swell",
		code: "S-01",
		stroke: ["#0d4682", "#8fd1ff"],
	},
	upcoming: { label: "Forecast", code: "S-02", stroke: ["#107245", "#83e6b2"] },
};

/**
 * Signature element: a live buoy readout that maps the shader's sampled
 * luminance and pointer to a plausible sea state — swell amplitude, wave
 * period, turbulence index, and a rolling 48-sample trace. Nothing is faked;
 * every number tracks the actual GPU output, so the panel breathes with the
 * waves beneath it.
 */
export function TideTelemetry({
	luminance,
	pointer,
	mode,
	className,
}: TideTelemetryProps) {
	const [history, setHistory] = useState<number[]>(() =>
		new Array(SPARK_POINTS).fill(0),
	);
	const lumRef = useRef(luminance);
	lumRef.current = luminance;

	useEffect(() => {
		const id = window.setInterval(() => {
			setHistory((h) => [...h.slice(1), lumRef.current]);
		}, 90);
		return () => window.clearInterval(id);
	}, []);

	const meta = MODE_META[mode];
	const clamped = Math.min(1, Math.max(0, luminance));

	// Map luminance (0–1) to a plausible significant wave height (≈0.4–4.2 m).
	const swellM = (0.4 + clamped * 3.8).toFixed(2);
	// Brighter crests read as a shorter, choppier period (≈11.5 s → 4 s).
	const periodS = (11.5 - clamped * 7.5).toFixed(1);
	// Turbulence climbs with luminance.
	const turbulence = Math.round(clamped * 100);
	// Pointer maps to a fictional grid bearing for the "station" feel.
	const bearing = Math.round(pointer.x * 359);
	const depth = Math.round(20 + pointer.y * 180);

	const path = history
		.map((v, i) => {
			const x = (i / (SPARK_POINTS - 1)) * 100;
			const y = 26 - v * 24;
			return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
		})
		.join(" ");

	const area = `${path} L100,26 L0,26 Z`;
	const gradId = `tide-spark-${mode}`;

	return (
		<div
			className={cn(
				"glass w-[244px] border border-tide-500/25",
				"shadow-[0_0_44px_-14px_rgba(40,152,242,0.6)]",
				className,
			)}
			role="status"
			aria-label="Live tide telemetry"
		>
			<div className="flex items-center justify-between border-b border-tide-500/20 px-3 py-2">
				<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-tide-100">
					<Radio className="h-3 w-3 animate-buoy-pulse text-tide-300" />
					Buoy 07
				</span>
				<span className="font-mono text-[10px] tracking-widest text-foam-300">
					{meta.code}
				</span>
			</div>

			<div className="px-3 pb-3 pt-2.5">
				<div className="flex items-end justify-between">
					<div className="flex items-baseline gap-1">
						<span className="font-mono text-[28px] leading-none tabular-nums text-foam-50">
							{swellM}
						</span>
						<span className="font-mono text-xs text-tide-300">m Hs</span>
					</div>
					<span className="font-mono text-[9px] uppercase tracking-[0.24em] text-foam-300">
						{meta.label}
					</span>
				</div>

				<svg
					viewBox="0 0 100 26"
					preserveAspectRatio="none"
					className="mt-2.5 h-7 w-full"
				>
					<defs>
						<linearGradient id={gradId} x1="0" y1="0" x2="100" y2="0">
							<stop offset="0%" stopColor={meta.stroke[0]} />
							<stop offset="100%" stopColor={meta.stroke[1]} />
						</linearGradient>
						<linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={meta.stroke[1]} stopOpacity="0.32" />
							<stop offset="100%" stopColor={meta.stroke[1]} stopOpacity="0" />
						</linearGradient>
					</defs>
					<path d={area} fill={`url(#${gradId}-fill)`} stroke="none" />
					<path
						d={path}
						fill="none"
						stroke={`url(#${gradId})`}
						strokeWidth={1.4}
						strokeLinejoin="round"
						strokeLinecap="round"
					/>
				</svg>

				<dl className="mt-2.5 space-y-1.5 font-mono text-[10px] uppercase tracking-widest">
					<Row icon={<Waves className="h-3 w-3" />} label="Period">
						{periodS} s
					</Row>
					<Row icon={<Wind className="h-3 w-3" />} label="Turbulence">
						{turbulence}%
					</Row>
					<Row icon={<Gauge className="h-3 w-3" />} label="Bearing">
						{String(bearing).padStart(3, "0")}° · {depth} m
					</Row>
				</dl>
			</div>
		</div>
	);
}

function Row({
	icon,
	label,
	children,
}: {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between text-foam-300">
			<span className="flex items-center gap-1.5">
				<span className="text-tide-300/80">{icon}</span>
				{label}
			</span>
			<span className="tabular-nums text-foam-50">{children}</span>
		</div>
	);
}
