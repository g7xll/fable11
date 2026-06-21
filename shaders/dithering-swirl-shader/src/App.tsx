import { useEffect, useRef, useState, type ReactNode } from "react";
import {
	Aperture,
	Gauge,
	Layers,
	Palette,
	Pause,
	Play,
	Zap,
} from "lucide-react";
import {
	DitheringShader,
	type DitheringShape,
	type DitheringType,
} from "@/components/ui/dithering-shader";
import { SignalTelemetry } from "@/components/signal-telemetry";
import { BayerMatrix } from "@/components/bayer-matrix";
import { cn } from "@/lib/utils";

const SHAPES: readonly DitheringShape[] = [
	"simplex",
	"warp",
	"dots",
	"wave",
	"ripple",
	"swirl",
	"sphere",
];

const TYPES: readonly DitheringType[] = ["random", "2x2", "4x4", "8x8"];

interface Palette {
	name: string;
	front: string;
	back: string;
}

// Two-colour phosphor pairs. The first is the prompt's exact demo (cyan beam on
// a deep-magenta void); the rest re-skin the same 1-bit field.
const PALETTES: readonly Palette[] = [
	{ name: "Cyan beam", front: "#00ffff", back: "#220011" },
	{ name: "Amber CRT", front: "#ffb000", back: "#1a0a00" },
	{ name: "Phosphor green", front: "#39ff14", back: "#001505" },
	{ name: "Ice", front: "#bdeaff", back: "#03101c" },
	{ name: "Magenta", front: "#ff37c7", back: "#190016" },
	{ name: "Bone", front: "#f4f4f4", back: "#050505" },
];

export default function App() {
	const [shape, setShape] = useState<DitheringShape>("swirl");
	const [type, setType] = useState<DitheringType>("4x4");
	const [paletteIdx, setPaletteIdx] = useState(0);
	const [pxSize, setPxSize] = useState(4);
	const [speed, setSpeed] = useState(0.9);
	const [coverage, setCoverage] = useState(0);
	const [fps, setFps] = useState(60);
	const [uptime, setUptime] = useState(0);

	const palette = PALETTES[paletteIdx];
	const lastSpeedRef = useRef(0.9);
	const paused = speed === 0;

	// Frame/uptime meter — counts rAF ticks and pushes to state a few times a
	// second (never per-frame, so it doesn't churn the tree under the shader).
	useEffect(() => {
		const start = performance.now();
		let raf = 0;
		let frames = 0;
		let acc = 0;
		let last = start;
		const loop = (now: number) => {
			frames += 1;
			acc += now - last;
			last = now;
			if (acc >= 350) {
				setFps((frames * 1000) / acc);
				setUptime((now - start) / 1000);
				frames = 0;
				acc = 0;
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);

	const togglePlay = () => {
		setSpeed((s) => {
			if (s === 0) return lastSpeedRef.current || 0.9;
			lastSpeedRef.current = s;
			return 0;
		});
	};

	return (
		<div className="crt-scanlines crt-vignette relative flex min-h-screen flex-col overflow-hidden bg-void font-sans text-cyan-50">
			{/* Live shader field, full-bleed behind everything */}
			<div className="fixed inset-0 z-0">
				<DitheringShader
					fill
					shape={shape}
					type={type}
					colorFront={palette.front}
					colorBack={palette.back}
					pxSize={pxSize}
					speed={speed}
					onSample={setCoverage}
					className="h-full w-full"
				/>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/25 via-transparent to-void/55" />
			</div>

			{/* Slow scan sweep */}
			<div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
				<div className="absolute inset-x-0 -top-24 h-24 animate-scan-sweep bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent blur-md" />
			</div>

			<Brackets />

			{/* Header */}
			<header className="relative z-20 flex items-center justify-between gap-4 border-b border-cyan-400/10 bg-ink/40 px-5 py-3.5 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<span className="grid h-7 w-7 place-items-center rounded-sm border border-cyan-400/40 bg-cyan-400/10 text-cyan-200">
						<Aperture className="h-4 w-4" />
					</span>
					<div className="leading-none">
						<p className="font-display text-sm font-semibold tracking-[0.22em] text-cyan-50">
							HALFTONE<span className="text-cyan-400">·</span>ENGINE
						</p>
						<p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-400/60">
							Ordered-Dither Press · WebGL2
						</p>
					</div>
				</div>
				<div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/70 sm:flex">
					<span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
					Signal live · {Math.round(fps)} fps
				</div>
			</header>

			{/* Stage */}
			<main className="relative z-20 flex-1">
				{/* Wordmark — in flow on mobile, centered over the field on desktop */}
				<div className="relative z-10 flex min-h-[44vh] items-center justify-center px-6 py-12 text-center lg:pointer-events-none lg:absolute lg:inset-0 lg:min-h-0 lg:py-0">
					<Wordmark shape={shape} type={type} />
				</div>

				{/* Floating instrument panels (corners on desktop, stacked on mobile) */}
				<div className="relative z-20 flex flex-col gap-4 px-4 pb-6 lg:contents">
					<div className="lg:absolute lg:right-6 lg:top-6 lg:w-72">
						<ControlDeck
							shape={shape}
							type={type}
							paletteIdx={paletteIdx}
							pxSize={pxSize}
							speed={speed}
							paused={paused}
							onShape={(v) => setShape(v as DitheringShape)}
							onType={(v) => setType(v as DitheringType)}
							onPalette={setPaletteIdx}
							onPxSize={setPxSize}
							onSpeed={setSpeed}
							onToggle={togglePlay}
						/>
					</div>

					<div className="lg:absolute lg:bottom-6 lg:left-6">
						<SignalTelemetry
							coverage={coverage}
							fps={fps}
							uptime={uptime}
							className="w-full lg:w-64"
						/>
					</div>

					<div className="lg:absolute lg:bottom-6 lg:right-6">
						<MatrixPanel type={type} />
					</div>
				</div>
			</main>

			{/* Footer — live prop readout, doubling as the integration cheatsheet */}
			<footer className="relative z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border-t border-cyan-400/10 bg-ink/40 px-5 py-3 font-mono text-[10px] text-cyan-300/55 backdrop-blur-sm">
				<span className="tracking-[0.14em]">
					<span className="text-cyan-400/80">@/components/ui/</span>
					dithering-shader.tsx
				</span>
				<span className="tracking-[0.1em]">
					shape=<b className="font-semibold text-cyan-100">{shape}</b> · type=
					<b className="font-semibold text-cyan-100">{type}</b> · pxSize=
					<b className="font-semibold text-cyan-100">{pxSize}</b> · speed=
					<b className="font-semibold text-cyan-100">{speed.toFixed(2)}</b>
				</span>
			</footer>
		</div>
	);
}

function Wordmark({
	shape,
	type,
}: {
	shape: DitheringShape;
	type: DitheringType;
}) {
	const matrix = type === "random" ? "a blue-noise hash" : `a ${type} Bayer`;
	return (
		<div className="animate-fade-in select-none">
			<p className="mb-4 font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-300/80">
				Threshold Screen · 1-Bit Press
			</p>
			<h1 className="phosphor font-display text-[clamp(3.2rem,13vw,9.5rem)] font-semibold uppercase leading-[0.82] tracking-tighter text-white">
				{shape}
			</h1>
			<p className="mx-auto mt-6 max-w-md font-mono text-[12px] leading-relaxed text-cyan-200/70">
				A WebGL2 fragment field quantised to two colours through {matrix}{" "}
				threshold matrix — every lit pixel decided on the GPU.
			</p>
		</div>
	);
}

interface ControlDeckProps {
	shape: DitheringShape;
	type: DitheringType;
	paletteIdx: number;
	pxSize: number;
	speed: number;
	paused: boolean;
	onShape: (v: string) => void;
	onType: (v: string) => void;
	onPalette: (i: number) => void;
	onPxSize: (n: number) => void;
	onSpeed: (n: number) => void;
	onToggle: () => void;
}

function ControlDeck(props: ControlDeckProps) {
	const { shape, type, paletteIdx, pxSize, speed, paused } = props;
	return (
		<section className="panel animate-rise rounded-md p-4">
			<div className="flex items-center justify-between">
				<h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
					Press Controls
				</h2>
				<button
					type="button"
					onClick={props.onToggle}
					className="flex items-center gap-1.5 rounded-sm border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100 transition-colors hover:border-cyan-400/60"
				>
					{paused ? (
						<Play className="h-3 w-3" />
					) : (
						<Pause className="h-3 w-3" />
					)}
					{paused ? "Run" : "Hold"}
				</button>
			</div>

			<Field icon={<Aperture className="h-3 w-3" />} label="Shape">
				<Toggles options={SHAPES} value={shape} onChange={props.onShape} />
			</Field>

			<Field icon={<Layers className="h-3 w-3" />} label="Dither matrix">
				<Toggles options={TYPES} value={type} onChange={props.onType} />
			</Field>

			<Field icon={<Palette className="h-3 w-3" />} label="Phosphor">
				<div className="flex flex-wrap gap-2">
					{PALETTES.map((p, i) => (
						<button
							key={p.name}
							type="button"
							title={p.name}
							aria-label={p.name}
							onClick={() => props.onPalette(i)}
							className={cn(
								"h-7 w-7 rounded-full border transition-transform",
								i === paletteIdx
									? "scale-110 border-cyan-200 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
									: "border-white/10 hover:scale-105",
							)}
							style={{
								background: `linear-gradient(135deg, ${p.front} 0 52%, ${p.back} 52% 100%)`,
							}}
						/>
					))}
				</div>
			</Field>

			<div className="mt-4 space-y-3.5">
				<Slider
					icon={<Gauge className="h-3 w-3" />}
					label="Pixel size"
					value={pxSize}
					min={1}
					max={12}
					step={1}
					suffix="px"
					onChange={props.onPxSize}
				/>
				<Slider
					icon={<Zap className="h-3 w-3" />}
					label="Speed"
					value={speed}
					min={0}
					max={2}
					step={0.05}
					suffix="×"
					format={(v) => v.toFixed(2)}
					onChange={props.onSpeed}
				/>
			</div>
		</section>
	);
}

function MatrixPanel({ type }: { type: DitheringType }) {
	const note =
		type === "random"
			? "Per-pixel hash (blue noise) — no fixed matrix"
			: `${type} ordered Bayer · live GPU lookup`;
	return (
		<section className="panel animate-rise rounded-md p-4">
			<div className="flex items-center justify-between gap-6">
				<h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">
					Threshold Matrix
				</h2>
				<span className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-400/50">
					{type}
				</span>
			</div>
			<div className="mt-3 w-40">
				<BayerMatrix type={type} />
			</div>
			<p className="mt-3 max-w-[10rem] font-mono text-[9px] leading-relaxed text-cyan-300/55">
				{note}
			</p>
		</section>
	);
}

function Field({
	icon,
	label,
	children,
}: {
	icon: ReactNode;
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="mt-4">
			<p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
				{icon}
				{label}
			</p>
			{children}
		</div>
	);
}

function Toggles({
	options,
	value,
	onChange,
}: {
	options: readonly string[];
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{options.map((o) => {
				const active = o === value;
				return (
					<button
						key={o}
						type="button"
						onClick={() => onChange(o)}
						className={cn(
							"rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
							active
								? "border-cyan-400/70 bg-cyan-400/15 text-cyan-100 phosphor-soft"
								: "border-cyan-400/15 text-cyan-300/55 hover:border-cyan-400/40 hover:text-cyan-200",
						)}
					>
						{o}
					</button>
				);
			})}
		</div>
	);
}

function Slider({
	icon,
	label,
	value,
	min,
	max,
	step,
	suffix,
	format,
	onChange,
}: {
	icon: ReactNode;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	suffix?: string;
	format?: (v: number) => string;
	onChange: (n: number) => void;
}) {
	const shown = format ? format(value) : String(value);
	return (
		<div>
			<div className="mb-1.5 flex items-center justify-between">
				<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300/70">
					{icon}
					{label}
				</span>
				<span className="font-mono text-[11px] tabular-nums text-cyan-100">
					{shown}
					{suffix}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="dither-range h-1 w-full cursor-pointer appearance-none rounded-full"
				aria-label={label}
			/>
		</div>
	);
}

function Brackets() {
	const base = "pointer-events-none fixed z-10 h-6 w-6 border-cyan-400/30";
	return (
		<>
			<span className={cn(base, "left-3 top-3 border-l border-t")} />
			<span className={cn(base, "right-3 top-3 border-r border-t")} />
			<span className={cn(base, "bottom-3 left-3 border-b border-l")} />
			<span className={cn(base, "bottom-3 right-3 border-b border-r")} />
		</>
	);
}
