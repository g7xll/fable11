import { useEffect, useMemo, useState } from "react";
import {
	Activity,
	Palette,
	Play,
	Pause,
	RotateCcw,
	Shapes,
	SlidersHorizontal,
	Sparkles,
} from "lucide-react";

import { WarpStage } from "@/components/lab/warp-stage";
import {
	CopyButton,
	Fader,
	Panel,
	Segments,
	Swatch,
} from "@/components/lab/primitives";
import { useTelemetry } from "@/lib/use-telemetry";
import {
	PROMPT_WARP,
	WARP_CONTROLS,
	WARP_PRESETS,
	WARP_SHAPES,
	type WarpConfig,
	type WarpShape,
} from "@/lib/warp";
import { cn } from "@/lib/utils";

const INSTALL_CMD = "npm i @paper-design/shaders-react";

const SHAPE_OPTIONS: { value: WarpShape; label: string }[] = WARP_SHAPES.map(
	(s) => ({
		value: s,
		label: s,
	}),
);

/** A single telemetry cell in the header strip. */
function Readout({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
	return (
		<div className="flex flex-col gap-0.5 border-l border-hairline px-3 first:border-l-0 first:pl-0">
			<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
				{k}
			</span>
			<span
				className={cn(
					"font-mono text-[13px] tabular-nums",
					accent ? "text-signal" : "text-ink",
				)}
			>
				{v}
			</span>
		</div>
	);
}

/** Corner bracket for the scope housing. */
function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
	const map: Record<string, string> = {
		tl: "left-0 top-0 border-l border-t",
		tr: "right-0 top-0 border-r border-t",
		bl: "left-0 bottom-0 border-l border-b",
		br: "right-0 bottom-0 border-r border-b",
	};
	return (
		<span
			aria-hidden
			className={cn(
				"pointer-events-none absolute h-5 w-5 border-signal",
				map[pos],
			)}
		/>
	);
}

export default function App() {
	const [config, setConfig] = useState<WarpConfig>(PROMPT_WARP);
	const [presetId, setPresetId] = useState<string | null>("lagoon");
	const [running, setRunning] = useState(true);

	const tel = useTelemetry();

	const activePreset = useMemo(
		() => WARP_PRESETS.find((p) => p.id === presetId) ?? null,
		[presetId],
	);

	/** Edit one continuous/enum field; any manual edit drops the preset tag. */
	function setField<K extends keyof WarpConfig>(key: K, value: WarpConfig[K]) {
		setConfig((c) => ({ ...c, [key]: value }));
		setPresetId(null);
	}

	function setColor(index: number, value: string) {
		setConfig((c) => {
			const colors = [...c.colors] as WarpConfig["colors"];
			colors[index] = value;
			return { ...c, colors };
		});
		setPresetId(null);
	}

	function applyPreset(id: string) {
		const preset = WARP_PRESETS.find((p) => p.id === id);
		if (!preset) return;
		setConfig(preset.config);
		setPresetId(preset.id);
	}

	function reset() {
		setConfig(PROMPT_WARP);
		setPresetId("lagoon");
	}

	// Space bar toggles the shader clock (ignored while typing in a field).
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement) return;
			if (e.code === "Space") {
				e.preventDefault();
				setRunning((r) => !r);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<div className="flex h-full min-h-screen w-full flex-col p-3 sm:p-4 lg:p-5">
			{/* ============================== HEADER ============================== */}
			<header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
				<div className="flex items-center gap-3">
					<div className="grid h-9 w-9 place-items-center rounded-md border border-hairline bg-panel">
						<Sparkles size={16} strokeWidth={1.75} className="text-signal" />
					</div>
					<div className="leading-none">
						<h1 className="font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-ink">
							Paper&nbsp;Warp
						</h1>
						<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.34em] text-ink-dim">
							Shader&nbsp;Lab&nbsp;/&nbsp;v0.0.76
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<div className="mr-3 flex items-center gap-2 rounded-full border border-hairline bg-panel px-3 py-1.5">
						<span
							className={cn(
								"h-2 w-2 rounded-full",
								running ? "pulse-dot bg-signal" : "bg-warn",
							)}
						/>
						<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-dim">
							{running ? "Live" : "Hold"}
						</span>
					</div>
					<Readout k="FPS" v={String(tel.fps).padStart(2, "0")} accent />
					<Readout k="Frames" v={tel.frames.toLocaleString("en-US")} />
					<Readout k="Uptime" v={`${tel.uptime.toFixed(1)}s`} />
					<Readout k="Shape" v={config.shape} accent />
				</div>
			</header>

			{/* ============================== BODY =============================== */}
			<main className="grid min-h-0 flex-1 grid-cols-1 gap-3 pt-3 lg:grid-cols-[320px_1fr] lg:gap-4">
				{/* -------- LEFT: instrument rack -------- */}
				<aside className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
					<Panel
						title="Presets"
						kicker="Same component · four moods"
						right={<Sparkles className="h-3.5 w-3.5 text-ink-dim" />}
					>
						<div className="grid grid-cols-2 gap-2">
							{WARP_PRESETS.map((p) => {
								const on = p.id === presetId;
								return (
									<button
										key={p.id}
										onClick={() => applyPreset(p.id)}
										aria-pressed={on}
										title={p.blurb}
										className={cn(
											"flex flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors",
											on
												? "border-signal/70 bg-signal/10"
												: "border-hairline bg-panel-2 hover:border-ink-dim/60",
										)}
									>
										<span
											className={cn(
												"font-mono text-[12px]",
												on ? "text-ink" : "text-ink-dim",
											)}
										>
											{p.name}
										</span>
										<span className="font-mono text-[9px] leading-tight text-ink-faint">
											{p.blurb}
										</span>
									</button>
								);
							})}
						</div>
					</Panel>

					<Panel
						title="Geometry"
						kicker="Shape of the field"
						right={<Shapes className="h-3.5 w-3.5 text-ink-dim" />}
					>
						<Segments
							ariaLabel="Warp shape"
							options={SHAPE_OPTIONS}
							value={config.shape}
							onChange={(v) => setField("shape", v)}
						/>
					</Panel>

					<Panel
						title="Parameter Bay"
						kicker="Live Warp uniforms"
						right={
							<div className="flex items-center gap-2">
								<Activity className="h-3.5 w-3.5 text-ink-dim" />
								<button
									onClick={() => setRunning((r) => !r)}
									aria-pressed={running}
									className={cn(
										"inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
										running
											? "border-hairline bg-rail text-ink-dim hover:text-ink"
											: "border-warn/60 bg-warn/10 text-warn",
									)}
								>
									{running ? (
										<Pause className="h-3 w-3" />
									) : (
										<Play className="h-3 w-3" />
									)}
									{running ? "Hold" : "Run"}
								</button>
								<button
									onClick={reset}
									className="inline-flex items-center gap-1 rounded-md border border-hairline bg-rail px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink"
								>
									<RotateCcw className="h-3 w-3" />
									Reset
								</button>
							</div>
						}
					>
						<div className="space-y-3.5">
							{WARP_CONTROLS.map((ctrl) => (
								<Fader
									key={ctrl.key}
									id={`fader-${ctrl.key}`}
									label={ctrl.label}
									hint={ctrl.hint}
									value={config[ctrl.key]}
									min={ctrl.min}
									max={ctrl.max}
									step={ctrl.step}
									onChange={(v) => setField(ctrl.key, v)}
								/>
							))}
						</div>
					</Panel>

					<Panel
						title="Palette"
						kicker="Four-stop colour ramp"
						right={<Palette className="h-3.5 w-3.5 text-ink-dim" />}
					>
						<div className="grid grid-cols-1 gap-2">
							{config.colors.map((c, i) => (
								<Swatch
									key={i}
									value={c}
									index={i}
									onChange={(v) => setColor(i, v)}
								/>
							))}
						</div>
					</Panel>

					<Panel
						title="Integrate"
						kicker="Drop-in components/ui"
						right={<SlidersHorizontal className="h-3.5 w-3.5 text-ink-dim" />}
					>
						<CopyButton
							text={INSTALL_CMD}
							label={INSTALL_CMD}
							className="w-full justify-start"
						/>
						<p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-dim/80">
							Copy <span className="text-ink-dim">wrap-shader.tsx</span> into{" "}
							<span className="text-ink-dim">/components/ui</span> and render{" "}
							<span className="text-ink-dim">&lt;WarpShaderHero /&gt;</span>{" "}
							behind any hero.
						</p>
					</Panel>
				</aside>

				{/* -------- RIGHT: scope viewport -------- */}
				<section className="relative min-h-0">
					<div className="scanlines scope-vignette relative h-full min-h-[60vh] w-full overflow-hidden rounded-lg border border-hairline bg-rail">
						{/* Live shader specimen — the verbatim hero, driven by the deck. */}
						<div className="absolute inset-0">
							<WarpStage config={config} frozen={!running} />
						</div>

						<Bracket pos="tl" />
						<Bracket pos="tr" />
						<Bracket pos="bl" />
						<Bracket pos="br" />

						{/* Top-left scope label */}
						<div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md border border-hairline bg-black/45 px-3 py-1.5 backdrop-blur-sm">
							<Sparkles size={13} className="text-signal" strokeWidth={1.75} />
							<span className="font-mono text-[11px] tracking-[0.06em] text-ink">
								{activePreset ? activePreset.name : "Custom"}
							</span>
							<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
								/ {config.shape}
							</span>
						</div>

						{/* Top-right scope readout */}
						<div className="pointer-events-none absolute right-4 top-4 flex items-center gap-3 rounded-md border border-hairline bg-black/45 px-3 py-1.5 font-mono text-[10px] backdrop-blur-sm">
							<span className="text-ink-dim">
								SPD{" "}
								<span className="text-signal">{config.speed.toFixed(2)}</span>
							</span>
							<span className="text-ink-dim">
								SCL{" "}
								<span className="text-signal">{config.scale.toFixed(2)}</span>
							</span>
						</div>

						{/* Bottom signal bus */}
						<div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
							<p className="max-w-[58%] font-mono text-[10px] leading-relaxed text-ink-dim">
								@paper-design/shaders-react · &lt;Warp&gt; —{" "}
								{config.swirlIterations}× swirl iterations, distortion{" "}
								{config.distortion.toFixed(2)}
							</p>
							<div className="signal-sweep relative h-1.5 w-40 overflow-hidden rounded-full border border-hairline bg-black/50" />
						</div>
					</div>
				</section>
			</main>

			{/* ============================== FOOTER ============================= */}
			<footer className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-hairline pt-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-dim">
				<span>
					Paper&nbsp;Warp&nbsp;Shader&nbsp;Lab — @paper-design/shaders-react ·
					WebGL
				</span>
				<span className="flex items-center gap-1.5 text-ink-dim/70">
					<span className="hidden sm:inline">Space holds the clock</span>
					<span className="text-signal-dim">●</span> GLSL
				</span>
			</footer>
		</div>
	);
}
