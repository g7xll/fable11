import { Activity, Flame, Gauge } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CoreTelemetryProps {
	/** 0–1 luminance sampled from the rendered shader. */
	luminance: number;
	className?: string;
}

const SPARK_POINTS = 40;

/**
 * Signature element: a live readout that maps the shader's centre-pixel
 * luminance to a plausible metallurgical "core" state — temperature, viscosity,
 * and a rolling thermal trace. Nothing here is faked; every number tracks the
 * actual GPU output, so the panel breathes with the lava beneath it.
 */
export function CoreTelemetry({ luminance, className }: CoreTelemetryProps) {
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

	// Map luminance (0–1) to a molten temperature range (≈760°C solidus to
	// 1480°C bright-yellow incandescence).
	const tempC = Math.round(760 + luminance * 720);
	// Hotter lava is thinner — viscosity falls as luminance climbs.
	const viscosity = (180 - luminance * 150).toFixed(1);
	const flux = Math.round(luminance * 100);

	const path = history
		.map((v, i) => {
			const x = (i / (SPARK_POINTS - 1)) * 100;
			const y = 26 - v * 24;
			return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
		})
		.join(" ");

	return (
		<div
			className={cn(
				"w-[230px] border border-ember-500/25 bg-forge-black/55 backdrop-blur-md",
				"shadow-[0_0_40px_-12px_rgba(255,94,0,0.55)]",
				className,
			)}
			role="status"
			aria-label="Live core telemetry"
		>
			<div className="flex items-center justify-between border-b border-ember-500/20 px-3 py-2">
				<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-ember-200">
					<Flame className="h-3 w-3 animate-ember-flicker text-ember-400" />
					Core
				</span>
				<span className="font-mono text-[10px] tracking-widest text-forge-steel">
					09
				</span>
			</div>

			<div className="px-3 pb-3 pt-2.5">
				<div className="flex items-baseline gap-1">
					<span className="font-mono text-[28px] leading-none text-ember-100 tabular-nums">
						{tempC}
					</span>
					<span className="font-mono text-xs text-ember-400">°C</span>
				</div>

				<svg
					viewBox="0 0 100 26"
					preserveAspectRatio="none"
					className="mt-2.5 h-7 w-full"
				>
					<defs>
						<linearGradient id="spark" x1="0" y1="0" x2="100" y2="0">
							<stop offset="0%" stopColor="#7a1900" />
							<stop offset="100%" stopColor="#ffb347" />
						</linearGradient>
					</defs>
					<path
						d={path}
						fill="none"
						stroke="url(#spark)"
						strokeWidth={1.4}
						strokeLinejoin="round"
						strokeLinecap="round"
					/>
				</svg>

				<dl className="mt-2.5 space-y-1.5 font-mono text-[10px] uppercase tracking-widest">
					<Row icon={<Gauge className="h-3 w-3" />} label="Viscosity">
						{viscosity} Pa·s
					</Row>
					<Row icon={<Activity className="h-3 w-3" />} label="Flux">
						{flux}%
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
		<div className="flex items-center justify-between text-forge-steel">
			<span className="flex items-center gap-1.5">
				<span className="text-ember-500/70">{icon}</span>
				{label}
			</span>
			<span className="text-ember-100 tabular-nums">{children}</span>
		</div>
	);
}
