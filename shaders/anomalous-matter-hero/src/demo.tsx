import { useCallback, useRef, useState } from "react";
import { AnomalousMatterHero } from "@/components/ui/anomalous-matter-hero";
import { Fader, FreezeToggle } from "@/components/containment-controls";
import { ContainmentTelemetry } from "@/components/containment-telemetry";

/**
 * The integration the prompt asks for. The `AnomalousMatterHero` is the fixed
 * full-viewport subject; everything around it is a quiet "containment lab"
 * instrument that reads the specimen's live energy off the GPU and steers its
 * displacement / glow / speed uniforms. The hero copy is overridden exactly as
 * the prompt's own `demo.tsx` does.
 */
export default function DemoOne() {
	const [displacement, setDisplacement] = useState(0.2);
	const [glow, setGlow] = useState(0.5);
	const [speed, setSpeed] = useState(1);
	const [paused, setPaused] = useState(false);
	const [energy, setEnergy] = useState(0);

	// Throttle the ~12×/s probe into React state to avoid render churn.
	const lastPush = useRef(0);
	const handleSample = useCallback((lum: number) => {
		const now = performance.now();
		if (now - lastPush.current > 120) {
			lastPush.current = now;
			setEnergy(lum);
		}
	}, []);

	return (
		<div className="lab-grid relative min-h-svh w-full overflow-hidden text-glow-50">
			{/* The component, used verbatim — copy overridden per the prompt demo. */}
			<AnomalousMatterHero
				title="Launch Sequence: Anomaly 12"
				subtitle="Energy dances along unseen frontiers."
				description="This demo shows how to override the default copy and integrate hero into a page layout."
				displacement={displacement}
				glow={glow}
				speed={speed}
				paused={paused}
				onSample={handleSample}
			/>

			{/* Containment frame + corner crops anchor the field as an instrument. */}
			<div className="pointer-events-none fixed inset-3 z-30 border border-glow-500/15 sm:inset-5">
				<Corner className="left-0 top-0 border-l border-t" />
				<Corner className="right-0 top-0 border-r border-t" />
				<Corner className="bottom-0 left-0 border-b border-l" />
				<Corner className="bottom-0 right-0 border-b border-r" />
			</div>

			{/* A slow reticle scope framing the specimen behind the copy. */}
			<Reticle />

			{/* Top utility bar */}
			<header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7">
				<div className="flex animate-rise items-center gap-3">
					<span className="grid h-8 w-8 place-items-center border border-glow-500/40 bg-void-black/55 backdrop-blur-md">
						<span className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-glow-400 shadow-[0_0_12px_rgba(52,182,241,0.9)]" />
					</span>
					<div className="leading-tight">
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-glow-200">
							Containment Lab
						</p>
						<p className="font-mono text-[9px] uppercase tracking-[0.28em] text-void-steel">
							Vault · Specimen 7-Δ
						</p>
					</div>
				</div>

				<div className="flex animate-rise items-center gap-2 [animation-delay:120ms]">
					<span className="hidden items-center gap-2 border border-glow-500/25 bg-void-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-glow-200 backdrop-blur-md sm:flex">
						<span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-glow-400" />
						Three.js · GLSL
					</span>
					<FreezeToggle paused={paused} onToggle={() => setPaused((p) => !p)} />
				</div>
			</header>

			{/* Control rail — faders wired straight into the shader uniforms. */}
			<div className="fixed bottom-6 left-5 z-40 hidden animate-rise flex-col gap-2 [animation-delay:480ms] sm:bottom-8 sm:left-8 md:flex">
				<Fader
					label="Flux"
					value={displacement}
					min={0}
					max={0.6}
					step={0.01}
					format={(v) => v.toFixed(2)}
					onChange={setDisplacement}
				/>
				<Fader
					label="Glow"
					value={glow}
					min={0}
					max={1.4}
					step={0.01}
					format={(v) => v.toFixed(2)}
					onChange={setGlow}
				/>
				<Fader
					label="Tempo"
					value={speed}
					min={0}
					max={3}
					step={0.05}
					unit="×"
					format={(v) => v.toFixed(2)}
					onChange={setSpeed}
				/>
			</div>

			{/* Live telemetry panel */}
			<div className="fixed bottom-6 right-5 z-40 hidden animate-rise [animation-delay:520ms] sm:bottom-8 sm:right-8 md:block">
				<ContainmentTelemetry energy={energy} paused={paused} />
			</div>

			{/* Bottom ledger — the actual shader recipe, framed as lab metadata. */}
			<footer className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-center gap-6 px-8 py-5 font-mono text-[10px] uppercase tracking-[0.24em] text-void-steel md:flex">
				<Ledger label="Geo" value="Icosahedron 1.2" />
				<Ledger label="Noise" value="snoise · ×2" />
				<Ledger label="Shade" value="Diffuse + fresnel" />
				<Ledger label="Light" value="Mouse-tracked" />
			</footer>
		</div>
	);
}

function Corner({ className }: { className?: string }) {
	return (
		<span
			className={`absolute h-5 w-5 border-glow-400/60 ${className ?? ""}`}
			aria-hidden
		/>
	);
}

function Reticle() {
	return (
		<div
			aria-hidden
			className="pointer-events-none fixed left-1/2 top-[42%] z-20 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2"
		>
			<svg
				viewBox="0 0 200 200"
				className="h-full w-full animate-reticle-spin opacity-30"
			>
				<circle
					cx="100"
					cy="100"
					r="94"
					fill="none"
					stroke="rgba(52,182,241,0.35)"
					strokeWidth="0.4"
					strokeDasharray="2 7"
				/>
				<circle
					cx="100"
					cy="100"
					r="74"
					fill="none"
					stroke="rgba(111,208,251,0.22)"
					strokeWidth="0.4"
				/>
				{[0, 90, 180, 270].map((a) => (
					<line
						key={a}
						x1="100"
						y1="4"
						x2="100"
						y2="14"
						stroke="rgba(111,208,251,0.55)"
						strokeWidth="0.7"
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
			<span className="text-glow-500/70">{label}</span>
			<span className="text-glow-100">{value}</span>
		</span>
	);
}
