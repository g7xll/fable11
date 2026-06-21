/**
 * The instrument rail — a brushed-metal eyepiece column down the right edge.
 * It carries the wordmark, a short caption that explains what the bench shows,
 * and a live telemetry block reading shader state straight off the render loop
 * (uptime, frame rate, dominant band, warp coordinates).
 */
import { Aperture, Microscope } from "lucide-react";
import type { ShaderParams } from "@/components/ui/liquid-crystal";
import type { InterferenceReading } from "@/lib/birefringence";

interface InstrumentRailProps {
	fps: number;
	time: number;
	mouse: { x: number; y: number };
	params: ShaderParams;
	reading: InterferenceReading;
}

function Readout({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: string;
}) {
	return (
		<div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-2 last:border-0">
			<span className="font-mono text-[10px] uppercase tracking-wider2 text-bench-steel">
				{label}
			</span>
			<span
				className="font-mono text-[13px] tabular-nums text-bench-bone"
				style={accent ? { color: accent } : undefined}
			>
				{value}
			</span>
		</div>
	);
}

export function InstrumentRail({
	fps,
	time,
	mouse,
	params,
	reading,
}: InstrumentRailProps) {
	const mm = String(Math.floor(time / 60)).padStart(2, "0");
	const ss = String(Math.floor(time % 60)).padStart(2, "0");
	const cs = String(Math.floor((time % 1) * 100)).padStart(2, "0");

	return (
		<aside className="pointer-events-auto absolute right-4 top-4 z-20 hidden w-[280px] animate-rise-slow flex-col gap-4 lg:flex">
			{/* Wordmark plate */}
			<div className="panel-brushed rounded-2xl border border-white/10 p-5 shadow-2xl">
				<div className="mb-3 flex items-center gap-2 text-prism-cyan">
					<Microscope className="h-4 w-4" strokeWidth={1.5} />
					<span className="font-mono text-[10px] uppercase tracking-ultra text-bench-steel">
						Bench 01
					</span>
				</div>
				<h1 className="font-display text-[34px] font-light leading-[0.95] tracking-tight text-bench-bone">
					Liquid
					<br />
					<span className="italic text-prism-cyan">Crystal</span>
				</h1>
				<p className="mt-3 text-[12.5px] leading-relaxed text-bench-bone/55">
					A WebGL interference field, read under crossed polarizers. Drag across
					the stage to warp the specimen; tune the bands from the panel.
				</p>
			</div>

			{/* Live telemetry */}
			<div className="panel-brushed rounded-2xl border border-white/10 p-5 shadow-2xl">
				<div className="mb-3 flex items-center justify-between">
					<span className="font-mono text-[10px] uppercase tracking-wider2 text-bench-steel">
						Telemetry
					</span>
					<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider2 text-prism-cyan">
						<span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-prism-cyan" />
						live
					</span>
				</div>
				<Readout label="Uptime" value={`${mm}:${ss}.${cs}`} />
				<Readout
					label="Frame rate"
					value={`${fps > 0 ? fps.toFixed(1) : "--"} fps`}
				/>
				<Readout label="Band" value={reading.colour} accent={reading.swatch} />
				<Readout label="Hue" value={`${Math.round(params.hue)}°`} />
				<Readout
					label="Warp xy"
					value={`${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)}`}
				/>
				<Readout label="Field" value={`${params.zoom.toFixed(2)}×`} />
			</div>

			{/* Aperture / mode chip */}
			<div className="panel-brushed flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-3 shadow-2xl">
				<Aperture className="h-4 w-4 text-prism-violet" strokeWidth={1.5} />
				<span className="font-mono text-[10px] uppercase tracking-wider2 text-bench-bone/70">
					Crossed polarizers · WebGL
				</span>
			</div>
		</aside>
	);
}
