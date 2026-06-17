import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Activity,
	Check,
	Copy,
	Droplets,
	Gauge,
	Moon,
	Palette,
	RotateCcw,
	Shuffle,
	Sparkles,
	Sun,
	Waves,
	Wind,
} from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { useTelemetry } from "@/lib/useTelemetry";
import { cn, clamp, luminance, normalizeHex } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Palette presets — each is a full set of MeshGradient colour stops the
 * component accepts, plus the geometry that suits it. Selecting one drives
 * the live shader; the first ("Brand Mint") is the component's own default.
 * ------------------------------------------------------------------ */
interface Preset {
	id: string;
	name: string;
	tag: string;
	colors: string[];
	distortion: number;
	swirl: number;
	speed: number;
	/** copy that suits the mood, so the demo reads as a real brand */
	title: string;
	highlight: string;
}

const PRESETS: Preset[] = [
	{
		id: "mint",
		name: "Brand Mint",
		tag: "DEFAULT",
		colors: ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
		distortion: 0.8,
		swirl: 0.6,
		speed: 0.42,
		title: "Intelligent AI Agents for",
		highlight: "Smart Brands",
	},
	{
		id: "aurora",
		name: "Aurora",
		tag: "COOL",
		colors: ["#3a86ff", "#8ecae6", "#a0c4ff", "#caffbf", "#bdb2ff", "#e0c3fc"],
		distortion: 1.15,
		swirl: 0.85,
		speed: 0.62,
		title: "Ship Calmer Products with",
		highlight: "Living Gradients",
	},
	{
		id: "ember",
		name: "Ember",
		tag: "WARM",
		colors: ["#ff7b54", "#ffb26b", "#ffd56b", "#ff9a8b", "#ff6f91", "#ffe5d0"],
		distortion: 0.95,
		swirl: 0.45,
		speed: 0.55,
		title: "Warm Up Every Launch with",
		highlight: "Soft Motion",
	},
	{
		id: "orchid",
		name: "Orchid",
		tag: "VIVID",
		colors: ["#b388eb", "#8093f1", "#72ddf7", "#f8c8dc", "#fbc4ab", "#e0aaff"],
		distortion: 1.3,
		swirl: 1.0,
		speed: 0.7,
		title: "Make the Hero the Story with",
		highlight: "Mesh Color",
	},
	{
		id: "graphite",
		name: "Graphite",
		tag: "MUTED",
		colors: ["#3a4750", "#606c76", "#8d99ae", "#c0c9d2", "#5c6b73", "#9db4c0"],
		distortion: 0.6,
		swirl: 0.3,
		speed: 0.3,
		title: "Quiet Confidence for",
		highlight: "Serious Software",
	},
];

const DEFAULT_OFFSET_X = 0.08;

/* ------------------------------------------------------------------ *
 * Small presentational atoms
 * ------------------------------------------------------------------ */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="flex flex-col leading-none">
			<span className="text-[9px] uppercase tracking-[0.18em] text-ink-dim">{label}</span>
			<span
				className={cn(
					"mt-1 font-mono text-[13px] tabular-nums",
					accent ? "text-sage-deep dark:text-sage" : "text-ink",
				)}
			>
				{value}
			</span>
		</div>
	);
}

function Fader({
	id,
	icon: Icon,
	label,
	value,
	min,
	max,
	step,
	unit,
	onChange,
}: {
	id: string;
	icon: typeof Gauge;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	unit: string;
	onChange: (v: number) => void;
}) {
	const fill = ((value - min) / (max - min)) * 100;
	return (
		<div className="group">
			<div className="mb-2 flex items-center justify-between">
				<span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
					<Icon className="size-3" strokeWidth={1.75} />
					{label}
				</span>
				<span className="font-mono text-[12px] tabular-nums text-ink">
					{value.toFixed(2)}
					<span className="ml-0.5 text-ink-dim">{unit}</span>
				</span>
			</div>
			<input
				id={id}
				type="range"
				className="fader"
				style={{ ["--fill" as string]: `${fill}%` }}
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				aria-label={label}
			/>
		</div>
	);
}

function ModuleCard({
	title,
	icon: Icon,
	right,
	children,
}: {
	title: string;
	icon: typeof Gauge;
	right?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-hairline bg-bone-2/70 paper-grain backdrop-blur-sm">
			<header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
				<h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
					<Icon className="size-3.5 text-sage-deep dark:text-sage" strokeWidth={2} />
					{title}
				</h3>
				{right}
			</header>
			<div className="p-4">{children}</div>
		</section>
	);
}

/* ------------------------------------------------------------------ *
 * Documentation dock — install / props / source / why components-ui
 * ------------------------------------------------------------------ */

const INSTALL_CMD = `npm i @paper-design/shaders-react lucide-react`;

const PROPS_API: Array<{ name: string; type: string; def: string; note: string }> = [
	{ name: "title", type: "string", def: '"Intelligent AI Agents for"', note: "Leading headline text" },
	{ name: "highlightText", type: "string", def: '"Smart Brands"', note: "Accent span (text-primary)" },
	{ name: "description", type: "string", def: '"Transform your brand…"', note: "Sub-headline paragraph" },
	{ name: "buttonText", type: "string", def: '"Join Waitlist"', note: "CTA label" },
	{ name: "onButtonClick", type: "() => void", def: "—", note: "CTA click handler" },
	{ name: "colors", type: "string[]", def: "6 mint/peach stops", note: "MeshGradient colour spots (≤ 10)" },
	{ name: "distortion", type: "number", def: "0.8", note: "Organic noise distortion (0–1+)" },
	{ name: "swirl", type: "number", def: "0.6", note: "Vortex distortion (0–1+)" },
	{ name: "speed", type: "number", def: "0.42", note: "Animation time multiplier" },
	{ name: "offsetX", type: "number", def: "0.08", note: "Horizontal centre offset (−1…1)" },
	{ name: "veilOpacity", type: "string", def: '"bg-white/20 dark:bg-black/25"', note: "Frosted veil over the shader" },
	{ name: "maxWidth", type: "string", def: '"max-w-6xl"', note: "Content column width" },
	{ name: "fontFamily", type: "string", def: '"Satoshi, sans-serif"', note: "Headline typeface" },
	{ name: "fontWeight", type: "number", def: "500", note: "Headline weight" },
];

function usageSnippet(p: { distortion: number; swirl: number; speed: number; colors: string[] }): string {
	const colors = p.colors.map((c) => `"${c}"`).join(", ");
	return `import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";

export default function Page() {
  return (
    <HeroSection
      title="Intelligent AI Agents for"
      highlightText="Smart Brands"
      colors={[${colors}]}
      distortion={${p.distortion}}
      swirl={${p.swirl}}
      speed={${p.speed}}
    />
  );
}`;
}

type Tab = "install" | "props" | "source" | "shadcn";

function Dock({
	tab,
	setTab,
	snippet,
	onCopy,
	copied,
}: {
	tab: Tab;
	setTab: (t: Tab) => void;
	snippet: string;
	onCopy: (text: string, key: string) => void;
	copied: string | null;
}) {
	const tabs: Array<{ id: Tab; label: string }> = [
		{ id: "install", label: "Install" },
		{ id: "props", label: "Props API" },
		{ id: "source", label: "Usage" },
		{ id: "shadcn", label: "Why /components/ui" },
	];

	return (
		<div className="rounded-xl border border-hairline bg-bone-2/70 paper-grain backdrop-blur-sm">
			<div className="flex flex-wrap items-center gap-1 border-b border-hairline px-2 py-1.5">
				{tabs.map((t) => (
					<button
						key={t.id}
						role="tab"
						aria-selected={tab === t.id}
						onClick={() => setTab(t.id)}
						className={cn(
							"tab-ink rounded-md px-3 py-1.5 text-[12px] font-medium",
							tab === t.id
								? "bg-sage/15 text-sage-deep dark:text-sage"
								: "text-ink-dim hover:text-ink",
						)}
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="p-4">
				{tab === "install" && (
					<div className="space-y-3">
						<p className="text-[13px] leading-relaxed text-ink-dim">
							Add the single runtime dependency the hero needs (the shader) plus the icon set,
							then drop the component into <code className="text-ink">src/components/ui</code>.
						</p>
						<CodeBlock
							code={INSTALL_CMD}
							onCopy={() => onCopy(INSTALL_CMD, "install")}
							copied={copied === "install"}
						/>
						<CodeBlock
							code={`# scaffold (fresh project)\nnpm create vite@latest my-app -- --template react-ts\nnpx shadcn@latest init        # writes components.json + the @/ alias\nnpm i tailwindcss @tailwindcss/vite`}
							onCopy={() =>
								onCopy(
									`npm create vite@latest my-app -- --template react-ts\nnpx shadcn@latest init\nnpm i tailwindcss @tailwindcss/vite`,
									"scaffold",
								)
							}
							copied={copied === "scaffold"}
						/>
					</div>
				)}

				{tab === "props" && (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-[12px]">
							<thead>
								<tr className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">
									<th className="py-1.5 pr-4 font-medium">Prop</th>
									<th className="py-1.5 pr-4 font-medium">Type</th>
									<th className="py-1.5 pr-4 font-medium">Default</th>
									<th className="py-1.5 font-medium">Notes</th>
								</tr>
							</thead>
							<tbody className="align-top">
								{PROPS_API.map((p) => (
									<tr key={p.name} className="border-t border-hairline">
										<td className="whitespace-nowrap py-1.5 pr-4 font-mono text-sage-deep dark:text-sage">
											{p.name}
										</td>
										<td className="whitespace-nowrap py-1.5 pr-4 font-mono text-ink">{p.type}</td>
										<td className="whitespace-nowrap py-1.5 pr-4 font-mono text-ink-dim">{p.def}</td>
										<td className="py-1.5 text-ink-dim">{p.note}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{tab === "source" && (
					<div className="space-y-3">
						<p className="text-[13px] leading-relaxed text-ink-dim">
							This snippet reflects the <strong className="text-ink">live</strong> deck above —
							recolour or drag a fader and copy a ready-to-paste call.
						</p>
						<CodeBlock code={snippet} onCopy={() => onCopy(snippet, "source")} copied={copied === "source"} />
					</div>
				)}

				{tab === "shadcn" && (
					<div className="space-y-3 text-[13px] leading-relaxed text-ink-dim">
						<p>
							shadcn/ui isn't a dependency you import — it copies source straight into your repo. The
							convention is <code className="text-ink">@/components/ui</code>, wired through a{" "}
							<code className="text-ink">@/*</code> path alias (in{" "}
							<code className="text-ink">tsconfig</code> + <code className="text-ink">vite.config</code>).
						</p>
						<ul className="list-disc space-y-1.5 pl-5">
							<li>
								The CLI writes here by default, so{" "}
								<code className="text-ink">npx shadcn@latest add …</code> drops files in the same place.
							</li>
							<li>
								The import <code className="text-ink">@/components/ui/hero-section-with-smooth-bg-shader</code>{" "}
								resolves regardless of how deep the importing file is nested.
							</li>
							<li>
								It keeps owned primitives separate from your app/feature components — predictable to find
								and to theme.
							</li>
						</ul>
						<p>
							This project mirrors that exactly: the verbatim component lives at{" "}
							<code className="text-ink">src/components/ui/hero-section-with-smooth-bg-shader.tsx</code>, and
							its shadcn tokens (<code className="text-ink">bg-background</code>,{" "}
							<code className="text-ink">text-primary</code>, <code className="text-ink">border-card</code>)
							are defined in the global stylesheet so every class resolves.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function CodeBlock({
	code,
	onCopy,
	copied,
}: {
	code: string;
	onCopy: () => void;
	copied: boolean;
}) {
	return (
		<div className="group relative overflow-hidden rounded-lg border border-hairline bg-bone/80">
			<button
				onClick={onCopy}
				className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-hairline bg-bone-2/90 px-2 py-1 text-[10px] uppercase tracking-wide text-ink-dim transition-colors hover:text-ink"
				aria-label="Copy code"
			>
				{copied ? <Check className="size-3 text-sage-deep dark:text-sage" /> : <Copy className="size-3" />}
				{copied ? "Copied" : "Copy"}
			</button>
			<pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-ink">
				<code>{code}</code>
			</pre>
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * The studio shell
 * ------------------------------------------------------------------ */

export default function App() {
	const tel = useTelemetry();

	// Live shader state — these flow straight into the verbatim HeroSection.
	const [presetId, setPresetId] = useState(PRESETS[0].id);
	const [colors, setColors] = useState<string[]>(PRESETS[0].colors);
	const [distortion, setDistortion] = useState(PRESETS[0].distortion);
	const [swirl, setSwirl] = useState(PRESETS[0].swirl);
	const [speed, setSpeed] = useState(PRESETS[0].speed);
	const [offsetX, setOffsetX] = useState(DEFAULT_OFFSET_X);
	const [title, setTitle] = useState(PRESETS[0].title);
	const [highlight, setHighlight] = useState(PRESETS[0].highlight);

	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [tab, setTab] = useState<Tab>("install");
	const [copied, setCopied] = useState<string | null>(null);
	const [clicks, setClicks] = useState(0);
	const copyTimer = useRef<number | null>(null);

	// Reflect the theme on <html> so the component's dark: veil branch engages.
	// The veil (`bg-white/20 dark:bg-black/25`) reacts to this class on its own —
	// no remount needed.
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	useEffect(() => {
		return () => {
			if (copyTimer.current) window.clearTimeout(copyTimer.current);
		};
	}, []);

	const applyPreset = useCallback((p: Preset) => {
		setPresetId(p.id);
		setColors(p.colors);
		setDistortion(p.distortion);
		setSwirl(p.swirl);
		setSpeed(p.speed);
		setOffsetX(DEFAULT_OFFSET_X);
		setTitle(p.title);
		setHighlight(p.highlight);
	}, []);

	const reset = useCallback(() => applyPreset(PRESETS[0]), [applyPreset]);

	const randomize = useCallback(() => {
		const rnd = () =>
			`#${Math.floor(Math.random() * 0xffffff)
				.toString(16)
				.padStart(6, "0")}`;
		setColors((prev) => prev.map(() => rnd()));
		setPresetId("custom");
	}, []);

	const setColorAt = useCallback((i: number, hex: string) => {
		setColors((prev) => prev.map((c, j) => (j === i ? normalizeHex(hex) : c)));
		setPresetId("custom");
	}, []);

	const copy = useCallback((text: string, key: string) => {
		const done = () => {
			setCopied(key);
			if (copyTimer.current) window.clearTimeout(copyTimer.current);
			copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
		};
		if (navigator.clipboard?.writeText) {
			navigator.clipboard.writeText(text).then(done).catch(done);
		} else {
			done();
		}
	}, []);

	const snippet = useMemo(
		() => usageSnippet({ distortion, swirl, speed, colors }),
		[distortion, swirl, speed, colors],
	);

	const activePreset = PRESETS.find((p) => p.id === presetId);

	return (
		<div className="bench relative flex min-h-screen flex-col">
			{/* ---- Live hero plate (fixed, full-viewport behind the chrome) ---- */}
			<div className="plate-bracket plate-vignette pointer-events-none fixed inset-0 z-0">
				<div className="pointer-events-auto absolute inset-0">
					<HeroSection
						title={title}
						highlightText={highlight}
						colors={colors}
						distortion={distortion}
						swirl={swirl}
						speed={speed}
						offsetX={offsetX}
						buttonText="Join Waitlist"
						onButtonClick={() => setClicks((c) => c + 1)}
					/>
				</div>
			</div>

			{/* ---- Top utility rail ---- */}
			<header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-bone/70 px-4 py-2.5 backdrop-blur-md sm:px-6">
				<div className="flex items-center gap-3">
					<span className="grid size-8 place-items-center rounded-lg border border-hairline bg-bone-2 text-sage-deep dark:text-sage">
						<Palette className="size-4" strokeWidth={2} />
					</span>
					<div className="leading-none">
						<div className="flex items-center gap-2">
							<h1 className="text-[13px] font-semibold tracking-tight text-ink">Mesh Gradient</h1>
							<span className="rounded-full border border-hairline px-1.5 py-0.5 font-mono text-[9px] text-ink-dim">
								shaders-react · 0.0.76
							</span>
						</div>
						<p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-dim">
							Hero Studio
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="hidden items-center gap-4 rounded-lg border border-hairline bg-bone-2/70 px-3 py-1.5 sm:flex">
						<span className="flex items-center gap-1.5">
							<span className="tally inline-block size-1.5 rounded-full bg-sage" />
							<span className="text-[9px] uppercase tracking-[0.18em] text-ink-dim">Live</span>
						</span>
						<Stat label="FPS" value={String(tel.fps)} accent />
						<Stat label="Frame" value={String(tel.frame)} />
						<Stat label="Uptime" value={`${tel.uptime.toFixed(1)}s`} />
						<Stat label="Stops" value={String(colors.length)} />
					</div>
					<button
						onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
						className="flex items-center gap-1.5 rounded-lg border border-hairline bg-bone-2/80 px-2.5 py-1.5 text-[11px] text-ink transition-colors hover:border-sage"
						aria-label="Toggle theme"
					>
						{theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
						<span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
					</button>
				</div>
			</header>

			{/* ---- Main work area: hero stage (spacer) + control deck ---- */}
			<main className="relative z-10 grid flex-1 grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_360px]">
				{/* Stage caption sits over the live hero (which is fixed behind) */}
				<div className="pointer-events-none relative hidden lg:block">
					<div className="pointer-events-auto absolute left-0 top-0 flex items-center gap-2 rounded-full border border-hairline bg-bone/55 px-3 py-1.5 backdrop-blur-md">
						<Sparkles className="size-3.5 text-sage-deep dark:text-sage" strokeWidth={2} />
						<span className="text-[11px] text-ink">
							Live specimen · <span className="font-mono">{activePreset?.name ?? "Custom"}</span>
						</span>
					</div>
					<div className="pointer-events-auto absolute bottom-0 left-0 flex items-center gap-2 rounded-full border border-hairline bg-bone/55 px-3 py-1.5 font-mono text-[11px] text-ink-dim backdrop-blur-md">
						<Activity className="size-3.5" strokeWidth={1.75} />
						CTA fired ×{clicks}
					</div>
				</div>

				{/* Control deck */}
				<div className="flex flex-col gap-4">
					{/* Palette presets */}
					<ModuleCard
						title="Palette"
						icon={Palette}
						right={
							<button
								onClick={randomize}
								className="flex items-center gap-1 rounded-md border border-hairline bg-bone px-2 py-1 text-[10px] uppercase tracking-wide text-ink-dim transition-colors hover:text-ink"
							>
								<Shuffle className="size-3" /> Random
							</button>
						}
					>
						<div className="grid grid-cols-1 gap-1.5">
							{PRESETS.map((p) => {
								const active = p.id === presetId;
								return (
									<button
										key={p.id}
										onClick={() => applyPreset(p)}
										aria-pressed={active}
										className={cn(
											"group flex items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors",
											active
												? "border-sage bg-sage/10"
												: "border-hairline bg-bone hover:border-sage/60",
										)}
									>
										<span className="flex h-6 w-16 overflow-hidden rounded-md border border-hairline">
											{p.colors.map((c, i) => (
												<span key={i} className="flex-1" style={{ background: c }} />
											))}
										</span>
										<span className="flex-1">
											<span className="block text-[12px] font-medium text-ink">{p.name}</span>
										</span>
										<span
											className={cn(
												"font-mono text-[9px] tracking-wide",
												active ? "text-sage-deep dark:text-sage" : "text-ink-dim",
											)}
										>
											{p.tag}
										</span>
									</button>
								);
							})}
						</div>

						{/* Editable stops */}
						<div className="mt-3 border-t border-hairline pt-3">
							<div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-dim">
								<Droplets className="size-3" strokeWidth={1.75} /> Color stops
							</div>
							<div className="grid grid-cols-6 gap-1.5">
								{colors.map((c, i) => (
									<label
										key={i}
										className="relative aspect-square overflow-hidden rounded-md border border-hairline"
										style={{ background: c }}
										title={`${normalizeHex(c)} — click to edit`}
									>
										<input
											type="color"
											className="swatch-input"
											value={normalizeHex(c)}
											onChange={(e) => setColorAt(i, e.target.value)}
											aria-label={`Color stop ${i + 1}`}
										/>
										<span
											className="pointer-events-none absolute bottom-0.5 left-0 right-0 text-center font-mono text-[7px] leading-none"
											style={{ color: luminance(c) > 0.5 ? "#1c2128cc" : "#ffffffcc" }}
										>
											{normalizeHex(c).slice(1)}
										</span>
									</label>
								))}
							</div>
						</div>
					</ModuleCard>

					{/* Geometry faders */}
					<ModuleCard title="Geometry" icon={Gauge}>
						<div className="space-y-4">
							<Fader
								id="fader-distortion"
								icon={Waves}
								label="Distortion"
								value={distortion}
								min={0}
								max={2}
								step={0.01}
								unit=""
								onChange={(v) => {
									setDistortion(clamp(v, 0, 2));
									setPresetId("custom");
								}}
							/>
							<Fader
								id="fader-swirl"
								icon={Wind}
								label="Swirl"
								value={swirl}
								min={0}
								max={2}
								step={0.01}
								unit=""
								onChange={(v) => {
									setSwirl(clamp(v, 0, 2));
									setPresetId("custom");
								}}
							/>
							<Fader
								id="fader-speed"
								icon={Gauge}
								label="Speed"
								value={speed}
								min={0}
								max={2}
								step={0.01}
								unit="×"
								onChange={(v) => {
									setSpeed(clamp(v, 0, 2));
									setPresetId("custom");
								}}
							/>
							<Fader
								id="fader-offset"
								icon={Activity}
								label="Offset X"
								value={offsetX}
								min={-1}
								max={1}
								step={0.01}
								unit=""
								onChange={(v) => {
									setOffsetX(clamp(v, -1, 1));
									setPresetId("custom");
								}}
							/>
						</div>

						<div className="mt-4 flex gap-2 border-t border-hairline pt-3">
							<button
								onClick={reset}
								className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline bg-bone px-3 py-2 text-[11px] font-medium text-ink transition-colors hover:border-sage"
							>
								<RotateCcw className="size-3.5" /> Reset
							</button>
							<button
								onClick={() => copy(INSTALL_CMD, "deck-install")}
								className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sage bg-sage/15 px-3 py-2 text-[11px] font-medium text-sage-deep transition-colors hover:bg-sage/25 dark:text-sage"
							>
								{copied === "deck-install" ? (
									<Check className="size-3.5" />
								) : (
									<Copy className="size-3.5" />
								)}
								{copied === "deck-install" ? "Copied" : "Install"}
							</button>
						</div>
					</ModuleCard>
				</div>
			</main>

			{/* ---- Documentation dock ---- */}
			<section className="relative z-10 px-4 pb-4 sm:px-6">
				<Dock tab={tab} setTab={setTab} snippet={snippet} onCopy={copy} copied={copied} />
			</section>

			{/* ---- Bottom signal bus ---- */}
			<footer className="relative z-10 overflow-hidden border-t border-hairline bg-bone/70 px-4 py-2 backdrop-blur-md sm:px-6">
				<div className="relative flex items-center justify-between font-mono text-[10px] text-ink-dim">
					<span className="flex items-center gap-2">
						<Sparkles className="size-3 text-sage-deep dark:text-sage" />
						MeshGradient · @paper-design/shaders-react · vendored Onest (Satoshi substitute)
					</span>
					<span className="hidden sm:inline">
						distortion {distortion.toFixed(2)} · swirl {swirl.toFixed(2)} · speed {speed.toFixed(2)}×
					</span>
				</div>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
					<span className="sweep absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-sage to-transparent" />
				</div>
			</footer>
		</div>
	);
}
