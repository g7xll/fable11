import {
	Activity,
	Atom,
	Gauge,
	Hexagon,
	Pause,
	Play,
	RadioTower,
	RotateCcw,
	ShieldAlert,
	Sparkles,
	Waves,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import AuraReactor, {
	type ReactorTelemetry,
} from "@/components/ui/aura-reactor";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
 * Aura Core — Plasma Containment Console
 *
 * The brief's verbatim `AuraCore` drop-in lives at `@/components/ui/aura-core`
 * and `@/components/demo`, untouched. This page integrates the *same* shader —
 * its inlined-OGL renderer and verbatim GLSL ported into the typed, controlled
 * `AuraReactor` — and frames it as a reactor monitoring station: the core is a
 * contained plasma specimen behind blast glass, and the surrounding console
 * owns its four field parameters and reads its live state off the GPU clock.
 * ────────────────────────────────────────────────────────────────────────── */

const PARAM_META = {
	hue: { min: 0, max: 360, step: 1 },
	power: { min: 0.1, max: 5, step: 0.1 },
	focus: { min: 5, max: 100, step: 1 },
	distortion: { min: 0, max: 3, step: 0.1 },
} as const;

type Params = { hue: number; power: number; focus: number; distortion: number };

interface Profile {
	id: string;
	name: string;
	band: string;
	blurb: string;
	params: Params;
}

// Reactor field profiles — each one is a real point in the shader's parameter
// space, named for the regime it produces.
const PROFILES: Profile[] = [
	{
		id: "halcyon",
		name: "Halcyon",
		band: "STANDBY",
		blurb: "Cool azure idle. Slack rays, gentle drift — the core at rest.",
		params: { hue: 210, power: 1.5, focus: 30, distortion: 1 },
	},
	{
		id: "solar-flare",
		name: "Solar Flare",
		band: "PEAK",
		blurb: "Amber overdrive. Tight rays, high field power, churning surface.",
		params: { hue: 38, power: 3.4, focus: 64, distortion: 1.8 },
	},
	{
		id: "ion-bloom",
		name: "Ion Bloom",
		band: "DIFFUSE",
		blurb:
			"Magenta haze. Soft focus and heavy distortion bloom the particle field.",
		params: { hue: 300, power: 2.2, focus: 14, distortion: 2.6 },
	},
	{
		id: "verdant",
		name: "Verdant",
		band: "STABLE",
		blurb: "Phosphor green. Sharp narrow rays over a near-still core.",
		params: { hue: 132, power: 1.1, focus: 88, distortion: 0.4 },
	},
];

// HSV(hue,0.7,1) → CSS, matching how the shader tints the core, so the console
// chrome stays in sync with the live hue dial.
function hueToCss(hue: number, value = 1): string {
	const c = value * 0.7;
	const h = (((hue % 360) + 360) % 360) / 60;
	const x = c * (1 - Math.abs((h % 2) - 1));
	let r = 0;
	let g = 0;
	let b = 0;
	if (h < 1) [r, g, b] = [c, x, 0];
	else if (h < 2) [r, g, b] = [x, c, 0];
	else if (h < 3) [r, g, b] = [0, c, x];
	else if (h < 4) [r, g, b] = [0, x, c];
	else if (h < 5) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];
	const m = value - c;
	const to = (n: number) => Math.round((n + m) * 255);
	return `rgb(${to(r)}, ${to(g)}, ${to(b)})`;
}

function hueBandName(hue: number): string {
	const h = ((hue % 360) + 360) % 360;
	if (h < 20 || h >= 330) return "INFRARED";
	if (h < 45) return "AMBER";
	if (h < 70) return "SODIUM";
	if (h < 160) return "PHOSPHOR";
	if (h < 200) return "AQUA";
	if (h < 255) return "AZURE";
	if (h < 300) return "VIOLET";
	return "MAGENTA";
}

function clamp(v: number, lo: number, hi: number) {
	return Math.min(hi, Math.max(lo, v));
}

function pad(n: number, len: number) {
	return n.toString().padStart(len, "0");
}

function formatClock(t: number): string {
	const total = Math.floor(t);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const cs = Math.floor((t - total) * 100);
	return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(cs, 2)}`;
}

// ── Small presentational atoms ──────────────────────────────────────────────

function Fader({
	label,
	unit,
	value,
	min,
	max,
	step,
	accent = "amber",
	onChange,
}: {
	label: string;
	unit: string;
	value: number;
	min: number;
	max: number;
	step: number;
	accent?: "amber" | "plasma";
	onChange: (v: number) => void;
}) {
	const pct = ((value - min) / (max - min)) * 100;
	return (
		<label className="block">
			<div className="flex items-baseline justify-between">
				<span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist">
					{label}
				</span>
				<span
					className={cn(
						"font-mono text-[11px] tabular-nums",
						accent === "plasma" ? "text-plasma" : "text-amber",
					)}
				>
					{value.toFixed(step < 1 ? 1 : 0)}
					<span className="ml-0.5 text-mist/60">{unit}</span>
				</span>
			</div>
			<input
				type="range"
				className={cn("fader mt-2", accent === "plasma" && "plasma")}
				style={{ ["--pct" as string]: `${pct}%` }}
				min={min}
				max={max}
				step={step}
				value={value}
				aria-label={label}
				onChange={(e) => onChange(parseFloat(e.target.value))}
			/>
		</label>
	);
}

function Readout({
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: string;
	sub?: string;
	accent?: string;
}) {
	return (
		<div className="border-t border-[var(--hair)] py-2.5 first:border-t-0">
			<div className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist/70">
				{label}
			</div>
			<div
				className="mt-1 font-mono text-[15px] tabular-nums leading-none"
				style={{ color: accent ?? "var(--ink)" }}
			>
				{value}
			</div>
			{sub ? (
				<div className="mt-0.5 font-mono text-[9px] tracking-wide text-mist/55">
					{sub}
				</div>
			) : null}
		</div>
	);
}

// ── App ─────────────────────────────────────────────────────────────────────

export default function App() {
	const [params, setParams] = useState<Params>(PROFILES[0].params);
	const [activeProfile, setActiveProfile] = useState<string | null>(
		PROFILES[0].id,
	);
	const [paused, setPaused] = useState(false);

	// Live telemetry. The reactor reports at ~20Hz (throttled inside the
	// component), so mirroring it into state drives the readouts without the
	// per-frame churn of a 60Hz update. Peak excitation is tracked in a ref so it
	// survives across renders without forcing extra ones.
	const peakRef = useRef(0);
	const [tele, setTele] = useState({ time: 0, fps: 60, proximity: 0, peak: 0 });

	const handleFrame = useCallback((t: ReactorTelemetry) => {
		if (t.proximity > peakRef.current) peakRef.current = t.proximity;
		setTele({
			time: t.time,
			fps: t.fps,
			proximity: t.proximity,
			peak: peakRef.current,
		});
	}, []);

	const setParam = useCallback((key: keyof Params, value: number) => {
		setParams((p) => ({ ...p, [key]: value }));
		setActiveProfile(null);
	}, []);

	const applyProfile = useCallback((profile: Profile) => {
		setParams(profile.params);
		setActiveProfile(profile.id);
		peakRef.current = 0;
	}, []);

	const reset = useCallback(() => {
		setParams(PROFILES[0].params);
		setActiveProfile(PROFILES[0].id);
		peakRef.current = 0;
		setPaused(false);
	}, []);

	const coreCss = useMemo(() => hueToCss(params.hue), [params.hue]);
	const band = hueBandName(params.hue);

	// Derived "engineering" numbers off the live parameters — gives the console
	// its instrument feel without inventing data: every figure is a function of
	// the actual shader uniforms or measured telemetry.
	const fieldPower = clamp((params.power / 5) * 100, 0, 100);
	const coherence = clamp((params.focus / 100) * 100, 0, 100);
	const turbulence = clamp((params.distortion / 3) * 100, 0, 100);
	// Containment integrity falls as the field destabilizes (more power + more
	// distortion = harder to hold). Purely cosmetic, but deterministic.
	const integrity = clamp(
		100 - fieldPower * 0.28 - turbulence * 0.22 + coherence * 0.12,
		42,
		100,
	);
	const integrityColor =
		integrity > 80
			? "var(--plasma)"
			: integrity > 62
				? "var(--amber)"
				: "var(--warn)";

	return (
		<div className="plate-grain relative flex h-full w-full flex-col overflow-hidden">
			{/* Ambient engineering grid */}
			<div
				className="eng-grid pointer-events-none absolute inset-0 opacity-60"
				aria-hidden
			/>

			{/* ── Top status rail ─────────────────────────────────────────────── */}
			<header className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--line-soft)] px-5 py-3 md:px-8">
				<div className="flex items-center gap-3">
					<div className="grid h-8 w-8 place-items-center rounded-sm border border-amber/40 bg-amber/5">
						<Atom className="h-4 w-4 text-amber" strokeWidth={1.6} />
					</div>
					<div className="leading-tight">
						<div className="font-display text-sm font-bold uppercase tracking-[0.26em] text-ink">
							Aura&nbsp;Core
						</div>
						<div className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/70">
							Plasma Containment · Bay 07
						</div>
					</div>
				</div>

				<div className="hidden items-center gap-6 md:flex">
					<StatusChip
						icon={<RadioTower className="h-3 w-3" />}
						label="LINK"
						value="LIVE"
						tone="plasma"
					/>
					<StatusChip
						icon={<Gauge className="h-3 w-3" />}
						label="RENDER"
						value={`${Math.round(tele.fps)} FPS`}
						tone="amber"
					/>
					<StatusChip
						icon={<ShieldAlert className="h-3 w-3" />}
						label="INTEGRITY"
						value={`${integrity.toFixed(0)}%`}
						tone={integrity > 62 ? "amber" : "warn"}
					/>
				</div>

				<div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
					<span className="hidden sm:inline">CLK</span>
					<span className="tabular-nums text-ink/90">
						{formatClock(tele.time)}
					</span>
					<span
						className={cn("ml-1 h-2 w-2 rounded-full", !paused && "live-dot")}
						style={{ background: paused ? "var(--mist)" : "var(--amber)" }}
					/>
				</div>
			</header>

			{/* ── Main grid ───────────────────────────────────────────────────── */}
			<main className="relative z-10 grid flex-1 min-h-0 grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_320px] md:gap-5 md:p-6 xl:grid-cols-[260px_1fr_320px]">
				{/* Left: reactor profiles (hidden on small, shown xl) */}
				<aside className="hidden min-h-0 flex-col gap-3 xl:flex">
					<SectionLabel
						icon={<Hexagon className="h-3 w-3" />}
						text="Field Profiles"
					/>
					<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto thin-scroll pr-1">
						{PROFILES.map((p) => {
							const active = activeProfile === p.id;
							const swatch = hueToCss(p.params.hue);
							return (
								<button
									key={p.id}
									onClick={() => applyProfile(p)}
									className={cn(
										"panel bracket group relative rounded-md p-3 text-left transition-colors",
										active
											? "ring-1 ring-amber/60"
											: "hover:border-[var(--line)]",
									)}
								>
									<div className="flex items-center justify-between">
										<span className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
											{p.name}
										</span>
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{
												background: swatch,
												boxShadow: `0 0 8px ${swatch}`,
											}}
										/>
									</div>
									<div className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-amber/80">
										{p.band}
									</div>
									<p className="mt-1.5 text-[11px] leading-snug text-mist">
										{p.blurb}
									</p>
								</button>
							);
						})}
					</div>
				</aside>

				{/* Center: containment viewport */}
				<section className="relative min-h-0">
					<SectionLabel
						icon={<Atom className="h-3 w-3" />}
						text="Containment Window"
						right={
							<span
								className="font-mono text-[9px] uppercase tracking-[0.24em]"
								style={{ color: coreCss }}
							>
								{band} · λ-BAND
							</span>
						}
					/>
					<div className="panel bracket scanlines viewport-vignette relative mt-3 h-[calc(100%-1.75rem)] min-h-[280px] overflow-hidden rounded-lg">
						{/* The verbatim shader, now console-controlled */}
						<AuraReactor
							hue={params.hue}
							power={params.power}
							focus={params.focus}
							distortion={params.distortion}
							paused={paused}
							onFrame={handleFrame}
							className="absolute inset-0"
						/>

						{/* Reticle gauge frame — the page signature */}
						<ReticleFrame color={coreCss} integrity={integrity} band={band} />

						{/* Bottom-left specimen tag */}
						<div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/55">
							SPEC · OGL-WEBGL2 · 60HZ
							<br />
							<span className="text-mist/45">
								FBM CORE / 10 RAYS / NOISE FIELD
							</span>
						</div>

						{/* Hover hint */}
						<div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/55">
							<Sparkles className="h-3 w-3 text-amber/70" />
							MOVE CURSOR TO EXCITE FIELD
						</div>

						{paused ? (
							<div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-sm border border-warn/50 bg-warn/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.28em] text-warn">
								Clock Held
							</div>
						) : null}
					</div>
				</section>

				{/* Right: control deck + telemetry */}
				<aside className="flex min-h-0 flex-col gap-4 overflow-auto thin-scroll md:gap-5">
					{/* Field controls */}
					<div className="panel bracket rounded-lg p-4">
						<div className="mb-3 flex items-center justify-between">
							<SectionLabel
								icon={<Waves className="h-3 w-3" />}
								text="Field Controls"
								inline
							/>
							<button
								onClick={() => setPaused((v) => !v)}
								className={cn(
									"flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
									paused
										? "border-amber/60 bg-amber/10 text-amber"
										: "border-[var(--line-soft)] text-mist hover:border-[var(--line)] hover:text-ink",
								)}
								aria-label={paused ? "Resume clock" : "Freeze clock"}
							>
								{paused ? (
									<Play className="h-3 w-3" />
								) : (
									<Pause className="h-3 w-3" />
								)}
								{paused ? "Resume" : "Freeze"}
							</button>
						</div>

						<div className="space-y-4">
							<Fader
								label="Hue"
								unit="°"
								value={params.hue}
								{...PARAM_META.hue}
								onChange={(v) => setParam("hue", v)}
							/>
							<Fader
								label="Power"
								unit="MW"
								value={params.power}
								{...PARAM_META.power}
								onChange={(v) => setParam("power", v)}
							/>
							<Fader
								label="Ray Focus"
								unit="κ"
								value={params.focus}
								{...PARAM_META.focus}
								onChange={(v) => setParam("focus", v)}
							/>
							<Fader
								label="Distortion"
								unit="Δ"
								value={params.distortion}
								{...PARAM_META.distortion}
								onChange={(v) => setParam("distortion", v)}
							/>
						</div>

						<button
							onClick={reset}
							className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--line-soft)] py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist transition-colors hover:border-[var(--line)] hover:text-ink"
						>
							<RotateCcw className="h-3 w-3" />
							Reset to Standby
						</button>
					</div>

					{/* Profile chips on tablet/mobile (xl shows the left rail instead) */}
					<div className="panel bracket rounded-lg p-4 xl:hidden">
						<SectionLabel
							icon={<Hexagon className="h-3 w-3" />}
							text="Field Profiles"
							inline
						/>
						<div className="mt-3 grid grid-cols-2 gap-2">
							{PROFILES.map((p) => {
								const active = activeProfile === p.id;
								const swatch = hueToCss(p.params.hue);
								return (
									<button
										key={p.id}
										onClick={() => applyProfile(p)}
										className={cn(
											"flex items-center gap-2 rounded-sm border px-2.5 py-2 text-left transition-colors",
											active
												? "border-amber/60 bg-amber/5"
												: "border-[var(--line-soft)] hover:border-[var(--line)]",
										)}
									>
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{
												background: swatch,
												boxShadow: `0 0 8px ${swatch}`,
											}}
										/>
										<span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
											{p.name}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Telemetry */}
					<div className="panel bracket rounded-lg p-4">
						<SectionLabel
							icon={<Activity className="h-3 w-3" />}
							text="Core Telemetry"
							inline
						/>
						<div className="mt-2">
							<Readout
								label="Containment Integrity"
								value={`${integrity.toFixed(1)} %`}
								sub={
									integrity > 80
										? "NOMINAL"
										: integrity > 62
											? "ELEVATED LOAD"
											: "DESTABILIZING"
								}
								accent={integrityColor}
							/>
							<Readout
								label="Field Power"
								value={`${fieldPower.toFixed(0)} %`}
								sub={`${params.power.toFixed(1)} MW DRAW`}
								accent="var(--amber)"
							/>
							<Readout
								label="Ray Coherence"
								value={`${coherence.toFixed(0)} %`}
								sub={`κ-FOCUS ${params.focus.toFixed(0)}`}
							/>
							<Readout
								label="Surface Turbulence"
								value={`${turbulence.toFixed(0)} %`}
								sub={`Δ ${params.distortion.toFixed(1)}`}
							/>
							<Readout
								label="Excitation"
								value={`${(tele.proximity * 100).toFixed(0)} %`}
								sub={`PEAK ${(tele.peak * 100).toFixed(0)}% · ${band}`}
								accent="var(--plasma)"
							/>
						</div>
					</div>
				</aside>
			</main>

			{/* ── Bottom legend ───────────────────────────────────────────────── */}
			<footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line-soft)] px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-mist/60 md:px-8">
				<span>
					drop-in&nbsp;·&nbsp;
					<span className="text-mist">@/components/ui/aura-core</span>
				</span>
				<span className="hidden sm:inline">
					shadcn
					structure&nbsp;·&nbsp;tailwind&nbsp;·&nbsp;typescript&nbsp;·&nbsp;webgl2
				</span>
				<span>uMouse · uTime · uColor · uPower · uFocus · uDistortion</span>
			</footer>
		</div>
	);
}

// ── Reticle gauge frame (signature element) ─────────────────────────────────

function ReticleFrame({
	color,
	integrity,
	band,
}: {
	color: string;
	integrity: number;
	band: string;
}) {
	// A scalable reticle: outer rotating tick ring + four crosshair ticks +
	// an arc that fills with containment integrity. Drawn in a viewBox-locked
	// SVG so it scales with the viewport and never blocks pointer events.
	const ticks = Array.from({ length: 60 });
	const arcCirc = 2 * Math.PI * 46;
	const arcOffset = arcCirc * (1 - integrity / 100);
	return (
		<svg
			className="pointer-events-none absolute left-1/2 top-1/2 h-[min(74vmin,560px)] w-[min(74vmin,560px)] -translate-x-1/2 -translate-y-1/2 opacity-90"
			viewBox="0 0 200 200"
			fill="none"
			aria-hidden
		>
			{/* faint outer guide circle */}
			<circle
				cx="100"
				cy="100"
				r="92"
				stroke="rgba(138,151,173,0.16)"
				strokeWidth="0.4"
			/>

			{/* rotating tick ring */}
			<g className="reticle-ring" style={{ transformOrigin: "100px 100px" }}>
				{ticks.map((_, i) => {
					const major = i % 5 === 0;
					const a = (i / 60) * Math.PI * 2;
					const r1 = 86;
					const r2 = major ? 80 : 83;
					return (
						<line
							key={i}
							x1={100 + Math.cos(a) * r1}
							y1={100 + Math.sin(a) * r1}
							x2={100 + Math.cos(a) * r2}
							y2={100 + Math.sin(a) * r2}
							stroke={major ? "rgba(255,204,77,0.6)" : "rgba(138,151,173,0.28)"}
							strokeWidth={major ? 0.7 : 0.4}
						/>
					);
				})}
			</g>

			{/* integrity arc */}
			<circle
				cx="100"
				cy="100"
				r="46"
				stroke="rgba(138,151,173,0.14)"
				strokeWidth="1"
				fill="none"
			/>
			<circle
				cx="100"
				cy="100"
				r="46"
				stroke={color}
				strokeWidth="1.4"
				fill="none"
				strokeLinecap="round"
				strokeDasharray={arcCirc}
				strokeDashoffset={arcOffset}
				transform="rotate(-90 100 100)"
				style={{
					transition: "stroke-dashoffset 240ms ease, stroke 240ms ease",
				}}
				opacity="0.85"
			/>

			{/* crosshair ticks */}
			{[0, 90, 180, 270].map((deg) => {
				const a = (deg / 180) * Math.PI;
				return (
					<line
						key={deg}
						x1={100 + Math.cos(a) * 70}
						y1={100 + Math.sin(a) * 70}
						x2={100 + Math.cos(a) * 76}
						y2={100 + Math.sin(a) * 76}
						stroke="rgba(95,217,255,0.5)"
						strokeWidth="0.7"
					/>
				);
			})}

			{/* band + integrity micro-labels */}
			<text
				x="100"
				y="34"
				textAnchor="middle"
				className="font-mono"
				fontSize="4.4"
				letterSpacing="1.4"
				fill="rgba(231,237,246,0.55)"
			>
				{band}
			</text>
			<text
				x="100"
				y="172"
				textAnchor="middle"
				className="font-mono"
				fontSize="4.4"
				letterSpacing="1.4"
				fill={color}
				opacity="0.8"
			>
				{integrity.toFixed(0)}% HOLD
			</text>
		</svg>
	);
}

// ── Shared chrome bits ──────────────────────────────────────────────────────

function StatusChip({
	icon,
	label,
	value,
	tone,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	tone: "amber" | "plasma" | "warn";
}) {
	const color =
		tone === "plasma"
			? "var(--plasma)"
			: tone === "warn"
				? "var(--warn)"
				: "var(--amber)";
	return (
		<div className="flex items-center gap-2">
			<span style={{ color }}>{icon}</span>
			<span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist/70">
				{label}
			</span>
			<span className="font-mono text-[11px] tabular-nums" style={{ color }}>
				{value}
			</span>
		</div>
	);
}

function SectionLabel({
	icon,
	text,
	right,
	inline = false,
}: {
	icon: React.ReactNode;
	text: string;
	right?: React.ReactNode;
	inline?: boolean;
}) {
	return (
		<div
			className={cn("flex items-center justify-between", !inline && "px-0.5")}
		>
			<div className="flex items-center gap-2">
				<span className="text-amber/80">{icon}</span>
				<span className="font-display text-[11px] font-semibold uppercase tracking-[0.26em] text-mist">
					{text}
				</span>
			</div>
			{right}
		</div>
	);
}
