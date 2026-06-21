import { Waves } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { TideTelemetry } from "@/components/tide-telemetry";
import FlowingWavesShader, {
	type WaveMode,
} from "@/components/ui/flowing-waves-shader";
import {
	AmplitudeDial,
	ClarityToggle,
	ModeSelector,
} from "@/components/wave-controls";

/**
 * DemoOne — the integration the prompt asks for. The flowing-waves shader is
 * the fixed full-viewport background; everything else is a calm "tidal field
 * observatory" laid over it, reading live state off the GPU and steering the
 * shader's `mode`, `dimmingDisabled`, and `intensity` uniforms (the original
 * three booleans, re-framed as a humane control surface).
 */
export default function DemoOne() {
	const [mode, setMode] = useState<WaveMode>("active");
	const [dimmingDisabled, setDimmingDisabled] = useState(false);
	const [intensity, setIntensity] = useState(0.92);

	const [luminance, setLuminance] = useState(0);
	const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

	// Throttle React state updates from the ~12×/s probes to avoid churn.
	const lastLum = useRef(0);
	const handleSample = useCallback((lum: number) => {
		const now = performance.now();
		if (now - lastLum.current > 120) {
			lastLum.current = now;
			setLuminance(lum);
		}
	}, []);

	const lastPtr = useRef(0);
	const handlePointer = useCallback((x: number, y: number) => {
		const now = performance.now();
		if (now - lastPtr.current > 120) {
			lastPtr.current = now;
			setPointer({ x, y });
		}
	}, []);

	const modeLabel =
		mode === "active" ? "Active" : mode === "upcoming" ? "Forecast" : "Calm";

	return (
		<div className="app-container relative min-h-svh w-full overflow-hidden text-foam-50">
			<FlowingWavesShader
				mode={mode}
				dimmingDisabled={dimmingDisabled}
				intensity={intensity}
				onSample={handleSample}
				onPointer={handlePointer}
			/>

			{/* Instrument frame + corner crops anchor the wave field as a "scope". */}
			<div className="pointer-events-none fixed inset-3 z-10 border border-tide-500/15 sm:inset-5">
				<Corner className="left-0 top-0 border-l border-t" />
				<Corner className="right-0 top-0 border-r border-t" />
				<Corner className="bottom-0 left-0 border-b border-l" />
				<Corner className="bottom-0 right-0 border-b border-r" />
				{/* A slow vertical sonar sweep across the glass. */}
				<span className="absolute inset-x-0 top-0 h-px animate-scan-sweep bg-gradient-to-r from-transparent via-tide-300/40 to-transparent" />
			</div>

			{/* Top utility bar */}
			<header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7">
				<div className="flex animate-rise items-center gap-3">
					<span className="grid h-8 w-8 place-items-center border border-tide-500/40 glass">
						<Waves className="h-4 w-4 animate-buoy-pulse text-tide-300" />
					</span>
					<div className="leading-tight">
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-tide-100">
							Meridian Tidal Lab
						</p>
						<p className="font-mono text-[9px] uppercase tracking-[0.28em] text-foam-300">
							Field Station · Buoy-07
						</p>
					</div>
				</div>

				<div className="flex animate-rise items-center gap-2 [animation-delay:120ms]">
					<span className="hidden items-center gap-2 border border-tide-500/25 glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-tide-100 md:flex">
						<span className="h-1.5 w-1.5 animate-buoy-pulse rounded-full bg-tide-300" />
						Live · GLSL
					</span>
					<ModeSelector value={mode} onChange={setMode} />
				</div>
			</header>

			{/* Hero thesis — the shader is the subject, so the title sits inside a
          slow scanning reticle that frames the wave field. */}
			<main className="pointer-events-none relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
				<div className="relative">
					<Reticle />
					<p className="animate-rise font-mono text-[11px] uppercase tracking-ultra text-tide-200 [animation-delay:160ms]">
						Interactive · 9-Octave · Wave Field
					</p>
					<h1 className="mt-4 animate-rise font-display text-[clamp(3.25rem,15vw,10.5rem)] font-light leading-[0.85] tracking-tight text-foam-50 [animation-delay:220ms] [text-shadow:0_1px_2px_rgba(3,7,13,0.6),0_2px_60px_rgba(40,152,242,0.4)]">
						Flowing
						<span className="block italic text-tide-100">Waves</span>
					</h1>
					<p className="mx-auto mt-5 max-w-md animate-rise font-mono text-xs uppercase tracking-[0.32em] text-foam-200/80 [animation-delay:320ms] sm:text-sm">
						A Three.js Fragment-Shader Sea
					</p>
				</div>

				{/* Control cluster — the original three booleans, made tactile. */}
				<div className="pointer-events-auto mt-12 flex animate-rise flex-wrap items-center justify-center gap-2 [animation-delay:420ms] sm:gap-3">
					<ClarityToggle
						value={dimmingDisabled}
						onChange={setDimmingDisabled}
					/>
					<AmplitudeDial value={intensity} onChange={setIntensity} />
				</div>
			</main>

			{/* Signature telemetry panel */}
			<div className="fixed bottom-6 right-5 z-20 hidden animate-rise [animation-delay:520ms] sm:bottom-8 sm:right-8 md:block">
				<TideTelemetry luminance={luminance} pointer={pointer} mode={mode} />
			</div>

			{/* Bottom ledger — encodes the actual shader recipe, not decoration. */}
			<footer className="fixed inset-x-0 bottom-0 z-20 hidden items-center justify-between gap-6 px-8 py-5 font-mono text-[10px] uppercase tracking-[0.24em] text-foam-300 md:flex">
				<Ledger label="Renderer" value="Three.js · WebGL" />
				<Ledger label="Field" value="cos displacement ×9" />
				<Ledger label="Center" value={dimmingDisabled ? "lifted" : "dimmed"} />
				<Ledger label="State" value={modeLabel} />
			</footer>
		</div>
	);
}

function Corner({ className }: { className?: string }) {
	return (
		<span
			className={`absolute h-5 w-5 border-tide-300/60 ${className ?? ""}`}
			aria-hidden
		/>
	);
}

function Reticle() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
		>
			<svg
				viewBox="0 0 200 200"
				className="h-full w-full animate-reticle-spin opacity-40"
			>
				<circle
					cx="100"
					cy="100"
					r="92"
					fill="none"
					stroke="rgba(84,182,255,0.32)"
					strokeWidth="0.5"
					strokeDasharray="2 6"
				/>
				<circle
					cx="100"
					cy="100"
					r="70"
					fill="none"
					stroke="rgba(40,152,242,0.22)"
					strokeWidth="0.5"
				/>
				{[0, 90, 180, 270].map((a) => (
					<line
						key={a}
						x1="100"
						y1="6"
						x2="100"
						y2="16"
						stroke="rgba(143,209,255,0.6)"
						strokeWidth="0.8"
						transform={`rotate(${a} 100 100)`}
					/>
				))}
			</svg>
		</div>
	);
}

function Ledger({ label, value }: { label: string; value: string }) {
	return (
		<span className="flex items-center gap-2">
			<span className="text-tide-300/70">{label}</span>
			<span className="text-foam-100">{value}</span>
		</span>
	);
}
