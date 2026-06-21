import { useMemo, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { Gauge, Grid2x2, Palette, RotateCcw, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioClock } from "@/lib/useStudioClock";

/** Relative luminance (0–1, Rec.601) of an `hsl(h, s%, l%)` string — used to
 *  report the configured front-ink's brightness. Returns 0 if unparseable. */
function hslLuminance(hsl: string): number {
	const m = hsl.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i);
	if (!m) return 0;
	const h = Number(m[1]) / 360;
	const s = Number(m[2]) / 100;
	const l = Number(m[3]) / 100;
	if (s === 0) return l;
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const hue = (tIn: number) => {
		let t = tIn;
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	const r = hue(h + 1 / 3);
	const g = hue(h);
	const b = hue(h - 1 / 3);
	return r * 0.299 + g * 0.587 + b * 0.114;
}

/** Approximate ink coverage from the dither matrix density and pattern scale —
 *  a denser bayer matrix and larger scale lay down more "ink". */
const MATRIX_DENSITY: Record<string, number> = {
	random: 0.5,
	"2x2": 0.42,
	"4x4": 0.5,
	"8x8": 0.58,
};

/** The valid DitheringShape union in @paper-design/shaders-react@0.0.76. */
const SHAPES = [
	"simplex",
	"warp",
	"dots",
	"wave",
	"ripple",
	"swirl",
	"sphere",
] as const;
type Shape = (typeof SHAPES)[number];

const DOTS =
	"radial-gradient(hsl(320,100%,70%) 35%, transparent 36%) 0 0 / 4px 4px";

/** Lightweight CSS-only thumbnails for the shape selector — a magenta halftone
 *  dot field composited over a per-shape gradient that evokes each pattern. No
 *  WebGL contexts spent. */
const SHAPE_THUMBS: Record<Shape, React.CSSProperties> = {
	simplex: {
		backgroundImage: `${DOTS}, linear-gradient(120deg, #2a0a1f, #000)`,
	},
	warp: {
		backgroundImage: `${DOTS}, conic-gradient(from 90deg at 50% 50%, #3a0a28, #000, #3a0a28)`,
	},
	dots: {
		backgroundImage: `radial-gradient(hsl(320,100%,70%) 45%, transparent 46%) 0 0 / 5px 5px, #000`,
	},
	wave: {
		backgroundImage: `${DOTS}, repeating-linear-gradient(0deg, #2a0a1f 0 3px, #000 3px 7px)`,
	},
	ripple: {
		backgroundImage: `${DOTS}, radial-gradient(circle at 50% 50%, #3a0a28, #000 70%)`,
	},
	swirl: {
		backgroundImage: `${DOTS}, conic-gradient(from 0deg at 50% 50%, #000, #3a0a28, #000)`,
	},
	sphere: {
		backgroundImage: `${DOTS}, radial-gradient(circle at 38% 35%, hsl(320,100%,70%), #2a0a1f 55%, #000 80%)`,
	},
};

/** The valid DitheringType (bayer matrix) union. */
const TYPES = ["random", "2x2", "4x4", "8x8"] as const;
type DType = (typeof TYPES)[number];

interface Swatch {
	name: string;
	back: string;
	front: string;
}

/** Named ink pairs — the component ships magenta/cyan; these extend it. */
const SWATCHES: Swatch[] = [
	{ name: "Magenta", back: "hsl(0, 0%, 0%)", front: "hsl(320, 100%, 70%)" },
	{ name: "Cyan", back: "hsl(0, 0%, 95%)", front: "hsl(220, 100%, 70%)" },
	{ name: "Acid", back: "hsl(260, 30%, 6%)", front: "hsl(150, 100%, 60%)" },
	{ name: "Ember", back: "hsl(20, 40%, 5%)", front: "hsl(30, 100%, 62%)" },
	{ name: "Bone", back: "hsl(40, 8%, 92%)", front: "hsl(0, 0%, 8%)" },
];

const DEFAULTS = {
	shape: "sphere" as Shape,
	type: "4x4" as DType,
	pxSize: 3,
	scale: 0.8,
	speed: 0.1,
	swatch: 0,
};

function Field({
	label,
	value,
	children,
}: {
	label: string;
	value: string;
	children: React.ReactNode;
}) {
	return (
		<label className="block">
			<div className="mb-2 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
				<span>{label}</span>
				<span className="tabular-nums text-ink">{value}</span>
			</div>
			{children}
		</label>
	);
}

/**
 * The live ink console: a real <Dithering> instance wired to the full prop
 * surface (shape / type / pxSize / scale / speed / colour pair). The telemetry
 * strip mirrors the live props plus a real rAF `fps`, and reports the front
 * ink's luminance and an estimated coverage derived from the configured dither
 * matrix + scale. (paper-shaders renders into a non-preserved WebGL buffer, so
 * post-composite readPixels returns zeros — the screenshot-based CLI verifier
 * is what asserts the shader is genuinely painting.)
 */
export function ShaderConsole() {
	const [shape, setShape] = useState<Shape>(DEFAULTS.shape);
	const [type, setType] = useState<DType>(DEFAULTS.type);
	const [pxSize, setPxSize] = useState(DEFAULTS.pxSize);
	const [scale, setScale] = useState(DEFAULTS.scale);
	const [speed, setSpeed] = useState(DEFAULTS.speed);
	const [swatchIdx, setSwatchIdx] = useState(DEFAULTS.swatch);

	const clock = useStudioClock();

	const swatch = SWATCHES[swatchIdx];

	// Front-ink luminance (real, parsed from the active swatch) and an estimated
	// coverage from the dither matrix density × pattern scale.
	const lum = useMemo(() => hslLuminance(swatch.front), [swatch.front]);
	const coverage = useMemo(
		() => Math.min(1, (MATRIX_DENSITY[type] ?? 0.5) * (0.6 + scale * 0.45)),
		[type, scale],
	);

	const reset = () => {
		setShape(DEFAULTS.shape);
		setType(DEFAULTS.type);
		setPxSize(DEFAULTS.pxSize);
		setScale(DEFAULTS.scale);
		setSpeed(DEFAULTS.speed);
		setSwatchIdx(DEFAULTS.swatch);
	};

	const telemetry = useMemo(
		() => [
			{ k: "shape", v: shape },
			{ k: "matrix", v: type },
			{ k: "px", v: String(pxSize) },
			{ k: "scale", v: scale.toFixed(2) },
			{ k: "speed", v: speed.toFixed(2) },
			{ k: "ink·L", v: lum.toFixed(3) },
			{ k: "cov", v: `${Math.round(coverage * 100)}%` },
			{ k: "fps", v: clock.fps ? clock.fps.toFixed(0) : "—" },
		],
		[shape, type, pxSize, scale, speed, lum, coverage, clock.fps],
	);

	return (
		<div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
			{/* ---- live stage ---- */}
			<div className="relative">
				<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black">
					<Dithering
						key={`${shape}-${type}`}
						style={{ height: "100%", width: "100%" }}
						colorBack={swatch.back}
						colorFront={swatch.front}
						shape={shape}
						type={type}
						pxSize={pxSize}
						scale={scale}
						speed={speed}
					/>
					<span className="crop crop-tl" />
					<span className="crop crop-tr" />
					<span className="crop crop-bl" />
					<span className="crop crop-br" />

					{/* live telemetry overlay */}
					<div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/55 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
						{telemetry.map((t) => (
							<span key={t.k} className="tabular-nums">
								<span className="text-white/40">{t.k}</span>{" "}
								<span className="text-[hsl(320,100%,78%)]">{t.v}</span>
							</span>
						))}
					</div>
					<div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-sm">
						<span className="ink-run inline-block h-1.5 w-1.5 rounded-full bg-[hsl(320,100%,70%)]" />
						webgl · live
					</div>
				</div>

				{/* shape selector — CSS halftone thumbnails (not live WebGL: a single
            extra GL context per tile would mean 7 more contexts, which is both
            slow under software rendering and close to the browser's per-page
            context cap. The active shape drives the one live stage above). */}
				<div className="mt-3 grid grid-cols-7 gap-2">
					{SHAPES.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => setShape(s)}
							aria-pressed={shape === s}
							title={s}
							className={cn(
								"group relative aspect-square overflow-hidden rounded-lg border bg-black transition-all",
								shape === s
									? "border-magenta ring-1 ring-magenta"
									: "border-border opacity-70 hover:opacity-100",
							)}
						>
							<span className="absolute inset-0" style={SHAPE_THUMBS[s]} />
							<span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-center font-mono text-[8px] uppercase tracking-wider text-white/80">
								{s}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* ---- controls ---- */}
			<div className="rounded-2xl border border-border bg-panel/60 p-5">
				<div className="mb-5 flex items-center justify-between">
					<div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-dim">
						<Gauge className="size-4 text-magenta" />
						ink console
					</div>
					<button
						type="button"
						onClick={reset}
						className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-dim transition-colors hover:border-magenta/60 hover:text-ink"
					>
						<RotateCcw className="size-3.5" />
						reset
					</button>
				</div>

				<div className="space-y-5">
					<Field label="px size" value={`${pxSize}px`}>
						<input
							id="fader-px"
							type="range"
							min={1}
							max={8}
							step={1}
							value={pxSize}
							onChange={(e) => setPxSize(Number(e.target.value))}
						/>
					</Field>
					<Field label="scale" value={scale.toFixed(2)}>
						<input
							id="fader-scale"
							type="range"
							min={0.2}
							max={1.6}
							step={0.01}
							value={scale}
							onChange={(e) => setScale(Number(e.target.value))}
						/>
					</Field>
					<Field label="speed" value={`${speed.toFixed(2)}×`}>
						<input
							id="fader-speed"
							type="range"
							min={0}
							max={1}
							step={0.01}
							value={speed}
							onChange={(e) => setSpeed(Number(e.target.value))}
						/>
					</Field>

					{/* matrix (dither type) */}
					<div>
						<div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
							<Grid2x2 className="size-3.5" /> bayer matrix
						</div>
						<div className="grid grid-cols-4 gap-1.5">
							{TYPES.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setType(t)}
									aria-pressed={type === t}
									className={cn(
										"rounded-md border px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
										type === t
											? "border-magenta bg-magenta/10 text-ink"
											: "border-border text-ink-dim hover:border-magenta/50 hover:text-ink",
									)}
								>
									{t}
								</button>
							))}
						</div>
					</div>

					{/* swatches (colour pair) */}
					<div>
						<div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
							<Palette className="size-3.5" /> ink pair
						</div>
						<div className="grid grid-cols-5 gap-1.5">
							{SWATCHES.map((s, i) => (
								<button
									key={s.name}
									type="button"
									onClick={() => setSwatchIdx(i)}
									aria-pressed={swatchIdx === i}
									title={s.name}
									className={cn(
										"group relative h-9 overflow-hidden rounded-md border transition-all",
										swatchIdx === i
											? "border-magenta ring-1 ring-magenta"
											: "border-border hover:border-ink-dim",
									)}
								>
									<span
										className="absolute inset-0"
										style={{ background: s.back }}
									/>
									<span
										className="absolute inset-x-0 bottom-0 h-1/2"
										style={{ background: s.front }}
									/>
								</button>
							))}
						</div>
						<div className="mt-2 font-mono text-[11px] text-ink-dim">
							<Waves className="mr-1 inline size-3 -translate-y-px" />
							{swatch.name} · front{" "}
							<span className="text-ink">{swatch.front}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
