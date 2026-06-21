import { ArrowDown, CornerDownRight, Zap } from "lucide-react";

import type { ShaderTelemetry } from "@/components/ui/shader-background-pro";

type HeroProps = {
	telemetry: ShaderTelemetry;
};

function Readout({
	label,
	value,
	unit,
	accent,
}: {
	label: string;
	value: string;
	unit?: string;
	accent?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1 px-4 py-3 first:pl-0">
			<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
				{label}
			</span>
			<span className="flex items-baseline gap-1 font-mono text-lg leading-none">
				<span className={accent ? "text-phosphor" : "text-ink"}>{value}</span>
				{unit && <span className="text-[11px] text-ink-faint">{unit}</span>}
			</span>
		</div>
	);
}

export function Hero({ telemetry }: HeroProps) {
	return (
		<section
			id="top"
			className="relative flex min-h-[100svh] flex-col justify-center px-5 pb-20 pt-28 sm:px-8"
		>
			<div className="mx-auto w-full max-w-6xl">
				{/* eyebrow */}
				<div
					className="rise mb-7 flex items-center gap-3"
					style={{ animationDelay: "60ms" }}
				>
					<span className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim backdrop-blur">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-phosphor opacity-60" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-phosphor" />
						</span>
						live · webgl · single file
					</span>
				</div>

				{/* headline */}
				<h1
					className="rise max-w-4xl font-display text-[clamp(2.7rem,8.5vw,6.4rem)] font-bold leading-[0.92] tracking-[-0.03em] text-balance text-ink"
					style={{ animationDelay: "120ms" }}
				>
					A plasma field
					<br />
					you can{" "}
					<span className="relative whitespace-nowrap text-violet">
						drop in
						<svg
							className="absolute -bottom-2 left-0 w-full"
							height="10"
							viewBox="0 0 300 10"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M2 7c40-7 90-7 148 0s108 7 148-2"
								stroke="var(--phosphor)"
								strokeWidth="2.5"
								strokeLinecap="round"
							/>
						</svg>
					</span>{" "}
					behind anything.
				</h1>

				<p
					className="rise mt-8 max-w-xl font-body text-base leading-relaxed text-ink-dim sm:text-lg"
					style={{ animationDelay: "220ms" }}
				>
					<span className="font-mono text-phosphor">shader-background.tsx</span>{" "}
					is the warping violet grid you're standing in front of — a
					self-contained WebGL component for shadcn/ui. No CSS. No dependencies.
					Mount it once and everything else floats on top.
				</p>

				{/* CTAs */}
				<div
					className="rise mt-9 flex flex-wrap items-center gap-3"
					style={{ animationDelay: "300ms" }}
				>
					<a
						href="#deck"
						className="group inline-flex items-center gap-2 rounded-md bg-violet px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#0b0418] transition-transform hover:-translate-y-0.5"
					>
						<Zap className="h-4 w-4" strokeWidth={2.4} />
						Tune the signal
					</a>
					<a
						href="#install"
						className="inline-flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-ink backdrop-blur transition-colors hover:border-phosphor"
					>
						<CornerDownRight className="h-4 w-4" />
						View the source
					</a>
				</div>

				{/* live telemetry HUD — the signature element */}
				<div
					className="rise brackets mt-14 max-w-2xl"
					style={{ animationDelay: "420ms" }}
				>
					<div className="panel scanlines rounded-lg">
						<div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
							<span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
								// telemetry · this very canvas
							</span>
							<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-phosphor">
								rec
								<span className="cursor-blink ml-1.5 inline-block h-2 w-2 rounded-full bg-phosphor align-middle" />
							</span>
						</div>
						<div className="flex flex-wrap divide-x divide-[var(--line)]">
							<Readout
								label="iTime"
								value={telemetry.time.toFixed(2)}
								unit="s"
								accent
							/>
							<Readout
								label="iResolution"
								value={`${telemetry.width}×${telemetry.height}`}
							/>
							<Readout
								label="frame rate"
								value={telemetry.fps.toFixed(0)}
								unit="fps"
							/>
							<Readout label="lines/group" value="16" />
							<Readout label="draw call" value="1" unit="/frame" />
						</div>
					</div>
				</div>
			</div>

			{/* scroll cue */}
			<a
				href="#deck"
				aria-label="Scroll to control deck"
				className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-ink sm:flex"
			>
				scroll
				<ArrowDown className="h-4 w-4 animate-bounce" />
			</a>
		</section>
	);
}
