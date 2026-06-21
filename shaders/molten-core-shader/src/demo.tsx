import { useCallback, useRef, useState } from "react";
import { Flame } from "lucide-react";
import MoltenCoreShader, {
	type MoltenCoreTheme,
} from "@/components/ui/molten-core-shader";
import { CoreTelemetry } from "@/components/core-telemetry";
import { IntensityDial, ThemeToggle } from "@/components/forge-controls";

/**
 * DemoOne — the integration the prompt asks for. The molten-core shader is the
 * fixed full-viewport background; everything else is a calm "foundry monitor"
 * laid over it, reading live state off the GPU and steering the shader's
 * `theme` and `intensity` uniforms.
 */
export default function DemoOne() {
	const [theme, setTheme] = useState<MoltenCoreTheme>("dark");
	const [intensity, setIntensity] = useState(0.82);
	const [luminance, setLuminance] = useState(0);

	// Throttle React state updates from the ~12×/s probe to avoid churn.
	const lastPush = useRef(0);
	const handleSample = useCallback((lum: number) => {
		const now = performance.now();
		if (now - lastPush.current > 120) {
			lastPush.current = now;
			setLuminance(lum);
		}
	}, []);

	return (
		<div className="app-container relative min-h-svh w-full overflow-hidden text-ember-50">
			<MoltenCoreShader
				theme={theme}
				intensity={intensity}
				onSample={handleSample}
			/>

			{/* Charred frame + corner crops anchor the molten field as an "instrument". */}
			<div className="pointer-events-none fixed inset-3 z-10 border border-ember-500/15 sm:inset-5">
				<Corner className="left-0 top-0 border-l border-t" />
				<Corner className="right-0 top-0 border-r border-t" />
				<Corner className="bottom-0 left-0 border-b border-l" />
				<Corner className="bottom-0 right-0 border-b border-r" />
			</div>

			{/* Top utility bar */}
			<header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7">
				<div className="flex animate-rise items-center gap-3">
					<span className="grid h-8 w-8 place-items-center border border-ember-500/40 bg-forge-black/55 backdrop-blur-md">
						<Flame className="h-4 w-4 animate-ember-flicker text-ember-400" />
					</span>
					<div className="leading-tight">
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember-200">
							Astra Forge
						</p>
						<p className="font-mono text-[9px] uppercase tracking-[0.28em] text-forge-steel">
							Containment Cell · Core-09
						</p>
					</div>
				</div>

				<div className="flex animate-rise items-center gap-2 [animation-delay:120ms]">
					<span className="hidden items-center gap-2 border border-ember-500/25 bg-forge-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ember-200 backdrop-blur-md md:flex">
						<span className="h-1.5 w-1.5 animate-ember-flicker rounded-full bg-ember-400" />
						Live · GLSL
					</span>
					<ThemeToggle value={theme} onChange={setTheme} />
				</div>
			</header>

			{/* Hero thesis — the shader is the subject, so the title sits inside a
          slow scanning reticle that frames the molten field. */}
			<main className="pointer-events-none relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
				<div className="relative">
					<Reticle />
					<p className="animate-rise font-mono text-[11px] uppercase tracking-ultra text-ember-300 [animation-delay:160ms]">
						Procedural · FBM · 6 Octaves
					</p>
					<h1 className="title mt-4 animate-rise font-display text-[clamp(3.5rem,16vw,11rem)] font-light leading-[0.85] tracking-tight text-ember-50 [animation-delay:220ms] [text-shadow:0_1px_2px_rgba(8,5,3,0.55),0_2px_60px_rgba(255,94,0,0.45)]">
						Molten Core
					</h1>
					<p className="description mx-auto mt-5 max-w-md animate-rise font-mono text-xs uppercase tracking-[0.35em] text-ember-100/80 [animation-delay:320ms] sm:text-sm">
						A Procedural Shader Animation
					</p>
				</div>

				<div className="pointer-events-auto mt-12 animate-rise [animation-delay:420ms]">
					<IntensityDial value={intensity} onChange={setIntensity} />
				</div>
			</main>

			{/* Signature telemetry panel */}
			<div className="fixed bottom-6 right-5 z-20 hidden animate-rise [animation-delay:520ms] sm:bottom-8 sm:right-8 md:block">
				<CoreTelemetry luminance={luminance} />
			</div>

			{/* Bottom ledger — encodes the actual shader recipe, not decoration. */}
			<footer className="fixed inset-x-0 bottom-0 z-20 hidden items-center justify-between gap-6 px-8 py-5 font-mono text-[10px] uppercase tracking-[0.24em] text-forge-steel md:flex">
				<Ledger label="Renderer" value="Three.js · WebGL" />
				<Ledger label="Field" value="2× FBM ramp" />
				<Ledger label="Stops" value="char → ember → gold" />
				<Ledger label="Base" value={theme} />
			</footer>
		</div>
	);
}

function Corner({ className }: { className?: string }) {
	return (
		<span
			className={`absolute h-5 w-5 border-ember-400/60 ${className ?? ""}`}
			aria-hidden
		/>
	);
}

function Reticle() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
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
					stroke="rgba(255,138,31,0.35)"
					strokeWidth="0.5"
					strokeDasharray="2 6"
				/>
				<circle
					cx="100"
					cy="100"
					r="70"
					fill="none"
					stroke="rgba(255,94,0,0.25)"
					strokeWidth="0.5"
				/>
				{[0, 90, 180, 270].map((a) => (
					<line
						key={a}
						x1="100"
						y1="6"
						x2="100"
						y2="16"
						stroke="rgba(255,179,71,0.6)"
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
			<span className="text-ember-500/70">{label}</span>
			<span className="text-ember-100">{value}</span>
		</span>
	);
}
