import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { Activity, Cpu, Radio } from "lucide-react";
import {
	ShaderCanvas,
	type ShaderSample,
} from "@/components/ui/interactive-shader";
import { FaderBank, type FaderSpec } from "@/components/flux-faders";
import { SignalTelemetry } from "@/components/signal-telemetry";

/**
 * DemoOne — the integration the brief asks for. The verbatim
 * `@/components/ui/interactive-shader` field is mounted in the recessed "scope
 * window" of FLUX·01, a single Eurorack-style synth module. The four shader
 * parameters become engraved faders on the faceplate; a live telemetry stack
 * reads the field's real per-frame output straight off the GPU. The shader's
 * own cursor-warp is the interactive moment, traced by a crosshair reticle.
 */
export default function DemoOne() {
	const [hue, setHue] = useState(204);
	const [speed, setSpeed] = useState(0.5);
	const [intensity, setIntensity] = useState(1.35);
	const [complexity, setComplexity] = useState(6);

	// Throttle React updates from the ~12×/s GPU probe so telemetry stays smooth
	// without churning the whole tree.
	const [sample, setSample] = useState<ShaderSample>({
		luminance: 0,
		hue: 0,
		fps: 60,
	});
	const lastPush = useRef(0);
	const handleSample = useCallback((s: ShaderSample) => {
		const now = performance.now();
		if (now - lastPush.current > 110) {
			lastPush.current = now;
			setSample(s);
		}
	}, []);

	const faders = useMemo<FaderSpec[]>(
		() => [
			{
				id: "hue",
				label: "Hue",
				legend: "0–360°",
				value: hue,
				min: 0,
				max: 360,
				step: 1,
				format: (v) => `${Math.round(v)}°`,
				onChange: setHue,
			},
			{
				id: "speed",
				label: "Speed",
				legend: "0–2.0×",
				value: speed,
				min: 0,
				max: 2,
				step: 0.01,
				format: (v) => v.toFixed(2),
				onChange: setSpeed,
			},
			{
				id: "intensity",
				label: "Intensity",
				legend: "0.1–3.0",
				value: intensity,
				min: 0.1,
				max: 3,
				step: 0.01,
				format: (v) => v.toFixed(2),
				onChange: setIntensity,
			},
			{
				id: "complexity",
				label: "Complexity",
				legend: "1–10 oct",
				value: complexity,
				min: 1,
				max: 10,
				step: 0.1,
				format: (v) => v.toFixed(1),
				onChange: setComplexity,
			},
		],
		[hue, speed, intensity, complexity],
	);

	return (
		<div className="app-shell relative min-h-svh w-full bg-chassis-900 px-4 py-6 text-ink-100 sm:px-8 sm:py-10 lg:px-12">
			<div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-[1200px] flex-col">
				<TopRail fps={sample.fps} />

				{/* The module faceplate. */}
				<section className="relative mt-5 flex-1 animate-panel-in overflow-hidden rounded-2xl border border-alu-500/40 bg-gradient-to-b from-alu-700 to-chassis-800 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
					{/* Brushed-metal sheen + rack screws. */}
					<div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.04)_45%,transparent_60%)]" />
					<Screw className="left-3 top-3" />
					<Screw className="right-3 top-3" />
					<Screw className="bottom-3 left-3" />
					<Screw className="bottom-3 right-3" />

					<div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
						<ScopeWindow
							hue={hue}
							speed={speed}
							intensity={intensity}
							complexity={complexity}
							onSample={handleSample}
						/>

						{/* Control column. */}
						<aside className="flex flex-col gap-4">
							<ModuleHeader />
							<div className="rounded-xl border border-alu-500/40 bg-chassis-800/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
								<p className="mb-4 font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
									Control voltage
								</p>
								<FaderBank faders={faders} />
							</div>
							<SignalTelemetry sample={sample} complexity={complexity} />
						</aside>
					</div>
				</section>

				<PatchNotes />
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function TopRail({ fps }: { fps: number }) {
	return (
		<header className="flex animate-rise items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<span className="grid h-9 w-9 place-items-center rounded-md border border-alu-500/50 bg-chassis-800">
					<Radio className="h-4 w-4 animate-led-flicker text-amber" />
				</span>
				<div className="leading-tight">
					<p className="font-display text-sm font-medium tracking-tight text-ink-50">
						Aperture Labs
					</p>
					<p className="font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
						Modular · Generative Field Series
					</p>
				</div>
			</div>

			<div className="hidden items-center gap-2 sm:flex">
				<Pill icon={<Cpu className="h-3 w-3" />} label="WebGL2 · FBM" />
				<Pill
					icon={<Activity className="h-3 w-3 text-patch" />}
					label={`${Math.round(fps)} fps`}
				/>
			</div>
		</header>
	);
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
	return (
		<span className="flex items-center gap-1.5 rounded-full border border-alu-500/40 bg-chassis-800/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide2 text-ink-300">
			{icon}
			{label}
		</span>
	);
}

function ModuleHeader() {
	return (
		<div className="rounded-xl border border-alu-500/40 bg-chassis-800/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
			<div className="flex items-center justify-between">
				<span className="font-mono text-[10px] uppercase tracking-wide2 text-amber">
					Module
				</span>
				<span className="font-mono text-[10px] uppercase tracking-wide2 text-ink-500">
					v1.0 · 14HP
				</span>
			</div>
			<h1 className="mt-1.5 font-display text-3xl font-semibold leading-none tracking-tight text-ink-50">
				FLUX·01
			</h1>
			<p className="mt-1 font-mono text-[11px] uppercase tracking-wide2 text-ink-400">
				Field Synthesizer
			</p>
		</div>
	);
}

interface ScopeWindowProps {
	hue: number;
	speed: number;
	intensity: number;
	complexity: number;
	onSample: (s: ShaderSample) => void;
}

function ScopeWindow({
	hue,
	speed,
	intensity,
	complexity,
	onSample,
}: ScopeWindowProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

	// Mirror the cursor within the scope so the shader's warp interaction is
	// legible — a crosshair reticle marks where the field bends toward.
	useEffect(() => {
		const el = frameRef.current;
		if (!el) return;
		const onMove = (e: MouseEvent) => {
			const rect = el.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			if (x < 0 || x > 1 || y < 0 || y > 1) setPointer(null);
			else setPointer({ x, y });
		};
		const onLeave = () => setPointer(null);
		window.addEventListener("mousemove", onMove);
		el.addEventListener("mouseleave", onLeave);
		return () => {
			window.removeEventListener("mousemove", onMove);
			el.removeEventListener("mouseleave", onLeave);
		};
	}, []);

	return (
		<div
			ref={frameRef}
			className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-alu-500/50 bg-chassis-950 shadow-[inset_0_2px_18px_rgba(0,0,0,0.85)] lg:aspect-auto lg:min-h-[460px]"
		>
			{/* The verbatim component's field. */}
			<ShaderCanvas
				hue={hue}
				speed={speed}
				intensity={intensity}
				complexity={complexity}
				onSample={onSample}
				className="absolute inset-0 h-full w-full"
			/>

			{/* Glass bezel highlight + scanline veil. */}
			<div className="scope-veil pointer-events-none absolute inset-0" />
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />

			{/* Corner ticks frame the field like a scope graticule. */}
			<Tick className="left-2 top-2 border-l border-t" />
			<Tick className="right-2 top-2 border-r border-t" />
			<Tick className="bottom-2 left-2 border-b border-l" />
			<Tick className="bottom-2 right-2 border-b border-r" />

			{/* Cursor reticle — the warp target. */}
			{pointer && (
				<div
					className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
					style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }}
					aria-hidden
				>
					<div className="relative h-14 w-14">
						<span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/35" />
						<span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/35" />
						<span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-reticle-spin rounded-full border border-amber/60" />
						<span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber shadow-[0_0_8px_rgba(244,183,64,0.9)]" />
					</div>
				</div>
			)}

			{/* In-window label strip. */}
			<div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between">
				<p className="font-mono text-[10px] uppercase tracking-wide2 text-ink-100/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
					Out · noise field
				</p>
				<p className="font-mono text-[10px] uppercase tracking-wide2 text-ink-100/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
					{pointer ? "Warp · tracking" : "Move cursor to warp"}
				</p>
			</div>
		</div>
	);
}

function PatchNotes() {
	const notes = [
		{
			tag: "Path",
			head: "components/ui",
			body: "Dropped in at @/components/ui/interactive-shader — the same convention shadcn uses, so it's importable by alias and discoverable next to the rest of the kit.",
		},
		{
			tag: "Props",
			head: "hue · speed · intensity · complexity",
			body: "Four numeric uniforms drive the field; the faceplate faders own that state and an onSample callback streams the field's live output back out.",
		},
		{
			tag: "Deps",
			head: "Zero runtime libraries",
			body: "Raw WebGL2 with a WebGL fallback — no three.js. Fonts are vendored locally, so the module runs fully offline with nothing hotlinked.",
		},
	];

	return (
		<footer className="mt-5 grid animate-rise gap-3 [animation-delay:140ms] sm:grid-cols-3">
			{notes.map((n) => (
				<div
					key={n.tag}
					className="rounded-xl border border-alu-500/30 bg-chassis-800/50 p-4"
				>
					<span className="font-mono text-[10px] uppercase tracking-wide2 text-amber">
						{n.tag}
					</span>
					<p className="mt-1.5 font-mono text-[12px] text-ink-100">{n.head}</p>
					<p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">
						{n.body}
					</p>
				</div>
			))}
		</footer>
	);
}

function Screw({ className }: { className?: string }) {
	return (
		<span
			className={`absolute h-3 w-3 rounded-full border border-black/60 bg-gradient-to-br from-alu-400 to-chassis-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${className ?? ""}`}
			aria-hidden
		>
			<span className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/55" />
		</span>
	);
}

function Tick({ className }: { className?: string }) {
	return (
		<span
			className={`pointer-events-none absolute h-4 w-4 border-white/25 ${className ?? ""}`}
			aria-hidden
		/>
	);
}
