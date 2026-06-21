import {
	Aperture,
	Cloud,
	Globe,
	Grip,
	type LucideIcon,
	Pause,
	Play,
	Radio,
	RotateCcw,
	Shuffle,
	Spline,
	Tornado,
	Waves,
} from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import DitherStage, { type DitherTelemetry } from "@/components/DitherStage";
import Fader from "@/components/Fader";
import type {
	DitheringShape,
	DitheringType,
} from "@/components/ui/dithering-shader";
import { cn } from "@/lib/utils";

/* ── Catalogue ─────────────────────────────────────────────────────────────
   The seven shapes and four dithering matrices exposed by the drop-in
   DitheringShader, paired with a Lucide glyph and a one-line description so the
   bench can narrate whatever the GPU is currently resolving. */

interface ShapeDef {
	key: DitheringShape;
	label: string;
	caption: string;
	Icon: LucideIcon;
}

const SHAPES: ShapeDef[] = [
	{
		key: "wave",
		label: "Wave",
		caption: "Advancing sine wavefront",
		Icon: Waves,
	},
	{
		key: "simplex",
		label: "Simplex",
		caption: "Fractal value-noise field",
		Icon: Cloud,
	},
	{
		key: "warp",
		label: "Warp",
		caption: "Domain-warped interference",
		Icon: Spline,
	},
	{
		key: "dots",
		label: "Dots",
		caption: "Randomised stripe lattice",
		Icon: Grip,
	},
	{
		key: "ripple",
		label: "Ripple",
		caption: "Radial standing waves",
		Icon: Radio,
	},
	{
		key: "swirl",
		label: "Swirl",
		caption: "Logarithmic spiral vortex",
		Icon: Tornado,
	},
	{
		key: "sphere",
		label: "Sphere",
		caption: "Lit orbiting hemisphere",
		Icon: Globe,
	},
];

interface MatrixDef {
	key: DitheringType;
	label: string;
	sub: string;
}

const MATRICES: MatrixDef[] = [
	{ key: "random", label: "RND", sub: "noise" },
	{ key: "2x2", label: "2×2", sub: "bayer" },
	{ key: "4x4", label: "4×4", sub: "bayer" },
	{ key: "8x8", label: "8×8", sub: "bayer" },
];

interface Preset {
	name: string;
	shape: DitheringShape;
	type: DitheringType;
	colorBack: string;
	colorFront: string;
	pxSize: number;
	speed: number;
}

// The first preset is the prompt's demo.tsx verbatim: wave / 8×8 / navy→magenta.
const PRESETS: Preset[] = [
	{
		name: "Wave",
		shape: "wave",
		type: "8x8",
		colorBack: "#001122",
		colorFront: "#ff0088",
		pxSize: 3,
		speed: 0.6,
	},
	{
		name: "Aurora",
		shape: "simplex",
		type: "8x8",
		colorBack: "#00121f",
		colorFront: "#22ffa8",
		pxSize: 4,
		speed: 0.5,
	},
	{
		name: "Orbit",
		shape: "sphere",
		type: "4x4",
		colorBack: "#0a0012",
		colorFront: "#ffd166",
		pxSize: 3,
		speed: 0.7,
	},
	{
		name: "Vortex",
		shape: "swirl",
		type: "random",
		colorBack: "#070010",
		colorFront: "#ff5d8f",
		pxSize: 2,
		speed: 0.9,
	},
	{
		name: "Sonar",
		shape: "ripple",
		type: "8x8",
		colorBack: "#00131c",
		colorFront: "#4fc3ff",
		pxSize: 3,
		speed: 0.8,
	},
];

const DEFAULT = PRESETS[0];

/** Convert HSL to a #rrggbb hex string (used by the randomiser). */
function hslHex(h: number, s: number, l: number): string {
	const sf = s / 100;
	const lf = l / 100;
	const a = sf * Math.min(lf, 1 - lf);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const c = lf - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round(255 * c)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

function App() {
	const [shape, setShape] = useState<DitheringShape>(DEFAULT.shape);
	const [type, setType] = useState<DitheringType>(DEFAULT.type);
	const [colorBack, setColorBack] = useState(DEFAULT.colorBack);
	const [colorFront, setColorFront] = useState(DEFAULT.colorFront);
	const [pxSize, setPxSize] = useState(DEFAULT.pxSize);
	const [speed, setSpeed] = useState(DEFAULT.speed);
	const [paused, setPaused] = useState(false);

	// Telemetry fires every animation frame; buffer it in a ref and flush to
	// state ~7×/s so the HUD stays live without forcing 60fps React re-renders.
	const teleRef = useRef<DitherTelemetry>({
		fps: 0,
		time: 0,
		width: 0,
		height: 0,
		cols: 0,
		rows: 0,
	});
	const [tele, setTele] = useState<DitherTelemetry>(teleRef.current);
	const onTelemetry = useCallback((t: DitherTelemetry) => {
		teleRef.current = t;
	}, []);
	useEffect(() => {
		const id = window.setInterval(() => setTele({ ...teleRef.current }), 140);
		return () => window.clearInterval(id);
	}, []);

	const applyPreset = (p: Preset) => {
		setShape(p.shape);
		setType(p.type);
		setColorBack(p.colorBack);
		setColorFront(p.colorFront);
		setPxSize(p.pxSize);
		setSpeed(p.speed);
	};

	const presetActive = (p: Preset) =>
		p.shape === shape &&
		p.type === type &&
		p.colorBack.toLowerCase() === colorBack.toLowerCase() &&
		p.colorFront.toLowerCase() === colorFront.toLowerCase() &&
		p.pxSize === pxSize &&
		p.speed === speed;

	const randomize = () => {
		const s = SHAPES[Math.floor(Math.random() * SHAPES.length)].key;
		const m = MATRICES[Math.floor(Math.random() * MATRICES.length)].key;
		const hue = Math.floor(Math.random() * 360);
		setShape(s);
		setType(m);
		setColorBack("#05060a");
		setColorFront(hslHex(hue, 92, 62));
		setPxSize(2 + Math.floor(Math.random() * 5));
		setSpeed(Math.round((0.3 + Math.random() * 0.8) * 100) / 100);
	};

	const idx = Math.max(
		0,
		SHAPES.findIndex((s) => s.key === shape),
	);
	const active = SHAPES[idx];

	return (
		<main className="relative h-full w-full overflow-hidden bg-ink">
			{/* Full-bleed shader stage — the only saturated colour on the page. */}
			<DitherStage
				shape={shape}
				type={type}
				colorBack={colorBack}
				colorFront={colorFront}
				pxSize={pxSize}
				speed={speed}
				paused={paused}
				onTelemetry={onTelemetry}
			/>

			{/* Print dot-screen + a single drifting scan line over the stage. */}
			<div className="dot-screen pointer-events-none absolute inset-0 z-10 opacity-50" />
			<div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
				<div className="scan-sweep absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-paper/25 to-transparent" />
			</div>

			{/* Reticle corner brackets frame the viewport as an instrument. */}
			<div className="reticle reticle-tl reticle-br pointer-events-none absolute inset-4 z-20 sm:inset-6" />
			<div className="reticle reticle-tr reticle-bl pointer-events-none absolute inset-4 z-20 sm:inset-6" />

			{/* Header lockup. */}
			<header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 bg-gradient-to-b from-ink/85 via-ink/40 to-transparent p-4 pb-10 sm:p-6 sm:pb-14">
				<div className="flex items-center gap-3">
					<span className="grid h-9 w-9 place-items-center rounded-md border border-line-strong bg-ink/60 text-amber">
						<Aperture className="h-5 w-5" strokeWidth={1.5} />
					</span>
					<div className="leading-tight">
						<h1 className="font-display text-lg font-bold tracking-[0.18em] text-paper">
							DITHER LAB
						</h1>
						<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
							WebGL2 · ordered / noise dithering bench
						</p>
					</div>
				</div>
				<div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash sm:flex">
					<span className="blink h-1.5 w-1.5 rounded-full bg-magenta" />
					live gpu feed
				</div>
			</header>

			{/* Hero readout — top-left under the header on mobile, bottom-left on desktop. */}
			<div className="pointer-events-none absolute inset-x-0 top-[88px] z-20 px-4 sm:px-6 md:inset-x-auto md:bottom-12 md:left-0 md:top-auto md:max-w-[calc(100%-392px)] md:px-10">
				<div key={shape} className="animate-rise">
					<div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-ash">
						<active.Icon
							className="h-3.5 w-3.5 text-amber"
							strokeWidth={1.75}
						/>
						shape {idx + 1} / {SHAPES.length}
					</div>
					<h2 className="font-display text-[clamp(3.25rem,11vw,7.5rem)] font-bold leading-[0.84] tracking-tighter text-paper">
						{active.label}
					</h2>
					<p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-ash">
						{active.caption} — pixelised to a {pxSize}px grid, then resolved to
						two inks through the {type} matrix.
					</p>
				</div>
			</div>

			{/* Control deck — bottom sheet on mobile, right rail on desktop. */}
			<aside className="panel absolute inset-x-0 bottom-0 z-30 max-h-[60vh] overflow-y-auto rounded-t-2xl md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:max-h-none md:w-[392px] md:rounded-none md:border-l">
				<div className="space-y-6 p-5 sm:p-6">
					{/* Telemetry, read straight off the stage each frame. */}
					<Section title="Telemetry">
						<div className="grid grid-cols-2 gap-2">
							<Readout label="fps" value={String(tele.fps)} />
							<Readout label="clock" value={`${tele.time.toFixed(1)}s`} />
							<Readout label="buffer" value={`${tele.width}×${tele.height}`} />
							<Readout label="cells" value={`${tele.cols}×${tele.rows}`} />
						</div>
					</Section>

					<Section title="Presets" hint="curated looks">
						<div className="flex flex-wrap gap-2">
							{PRESETS.map((p) => (
								<button
									key={p.name}
									type="button"
									onClick={() => applyPreset(p)}
									className={cn(
										"rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
										presetActive(p)
											? "border-amber/60 bg-amber/10 text-paper"
											: "border-line text-ash hover:border-line-strong hover:text-paper",
									)}
								>
									{p.name}
								</button>
							))}
						</div>
					</Section>

					<Section title="Shape" hint={`${SHAPES.length} fields`}>
						<div className="grid grid-cols-2 gap-2">
							{SHAPES.map((s, i) => {
								const Icon = s.Icon;
								const selected = s.key === shape;
								return (
									<button
										key={s.key}
										type="button"
										onClick={() => setShape(s.key)}
										aria-pressed={selected}
										className={cn(
											"flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
											i === 0 && "col-span-2",
											selected
												? "border-amber/60 bg-amber/10 text-paper"
												: "border-line bg-ink/30 text-ash hover:border-line-strong hover:text-paper",
										)}
									>
										<Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
										<span className="font-mono text-[11px] uppercase tracking-[0.12em]">
											{s.label}
										</span>
									</button>
								);
							})}
						</div>
					</Section>

					<Section title="Dithering matrix" hint="threshold map">
						<div className="grid grid-cols-4 gap-2">
							{MATRICES.map((m) => {
								const selected = m.key === type;
								return (
									<button
										key={m.key}
										type="button"
										onClick={() => setType(m.key)}
										aria-pressed={selected}
										className={cn(
											"rounded-md border px-2 py-2 text-center transition-colors",
											selected
												? "border-amber/60 bg-amber/10 text-paper"
												: "border-line bg-ink/30 text-ash hover:border-line-strong hover:text-paper",
										)}
									>
										<div className="font-mono text-xs font-medium tabular-nums">
											{m.label}
										</div>
										<div className="font-mono text-[8px] uppercase tracking-wide text-ash-dim">
											{m.sub}
										</div>
									</button>
								);
							})}
						</div>
					</Section>

					<Section title="Inks">
						<div className="grid grid-cols-2 gap-3">
							<Swatch
								label="front"
								value={colorFront}
								onChange={setColorFront}
							/>
							<Swatch label="back" value={colorBack} onChange={setColorBack} />
						</div>
					</Section>

					<Section title="Uniforms">
						<div className="space-y-4">
							<Fader
								label="Pixel grid"
								value={pxSize}
								min={1}
								max={10}
								step={1}
								display={`${pxSize} px`}
								onChange={(v) => setPxSize(Math.round(v))}
							/>
							<Fader
								label="Clock speed"
								value={speed}
								min={0}
								max={2}
								step={0.05}
								display={`${speed.toFixed(2)}×`}
								onChange={setSpeed}
							/>
						</div>
					</Section>

					<Section title="Transport">
						<div className="grid grid-cols-3 gap-2">
							<TransportButton onClick={() => setPaused((p) => !p)}>
								{paused ? (
									<Play className="h-3.5 w-3.5" />
								) : (
									<Pause className="h-3.5 w-3.5" />
								)}
								{paused ? "Resume" : "Freeze"}
							</TransportButton>
							<TransportButton onClick={randomize}>
								<Shuffle className="h-3.5 w-3.5" />
								Random
							</TransportButton>
							<TransportButton
								onClick={() => {
									applyPreset(DEFAULT);
									setPaused(false);
								}}
							>
								<RotateCcw className="h-3.5 w-3.5" />
								Reset
							</TransportButton>
						</div>
					</Section>

					<p className="border-t border-line pt-4 font-mono text-[10px] leading-relaxed text-ash-dim">
						Drop-in lives at{" "}
						<span className="text-ash">@/components/ui/dithering-shader</span>.
						This bench drives the same GLSL ES 3.00 through live uniforms — no
						recompiles per change.
					</p>
				</div>
			</aside>
		</main>
	);
}

/* ── Small presentational helpers ─────────────────────────────────────────── */

function Section({
	title,
	hint,
	children,
}: {
	title: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<section>
			<div className="mb-2.5 flex items-baseline justify-between">
				<h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
					{title}
				</h3>
				{hint && (
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash-dim">
						{hint}
					</span>
				)}
			</div>
			{children}
		</section>
	);
}

function Readout({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border border-line bg-ink/40 px-3 py-2">
			<div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ash-dim">
				{label}
			</div>
			<div className="font-mono text-sm tabular-nums text-paper">{value}</div>
		</div>
	);
}

function Swatch({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div>
			<div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
				{label}
			</div>
			<div className="flex items-center gap-2 rounded-md border border-line bg-ink/30 p-1.5">
				<span className="block h-8 w-8 shrink-0 overflow-hidden rounded">
					<input
						type="color"
						aria-label={`${label} colour`}
						className="swatch-input h-full w-full"
						value={value}
						onChange={(e) => onChange(e.target.value)}
					/>
				</span>
				<span className="font-mono text-xs uppercase tabular-nums text-paper">
					{value}
				</span>
			</div>
		</div>
	);
}

function TransportButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center justify-center gap-1.5 rounded-md border border-line bg-ink/30 px-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ash transition-colors hover:border-line-strong hover:text-paper"
		>
			{children}
		</button>
	);
}

export default App;
