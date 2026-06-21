import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Radio } from "lucide-react";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

/**
 * Live readout sampled from real requestAnimationFrame deltas. Feeds the
 * instrument strips so the telemetry is the page's actual frame rate / uptime,
 * not decorative numbers.
 */
function useLiveTelemetry() {
	const [fps, setFps] = useState(60);
	const [phase, setPhase] = useState(0); // seconds elapsed — mirrors the shader's `time` cadence (+0.01/frame)

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		let raf = 0;
		let last = performance.now();
		let acc = 0;
		let frames = 0;
		const start = last;

		const tick = (now: number) => {
			const dt = now - last;
			last = now;
			acc += dt;
			frames += 1;
			if (acc >= 500) {
				setFps(Math.round((frames * 1000) / acc));
				setPhase((now - start) / 1000);
				acc = 0;
				frames = 0;
			}
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return { fps, phase };
}

function Telemetry({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline gap-2">
			<span className="tele text-white/35">{label}</span>
			<span className="tele text-white/85">{value}</span>
		</div>
	);
}

export default function App() {
	const { fps, phase } = useLiveTelemetry();
	const cardRef = useRef<HTMLDivElement>(null);

	// Pad the shader phase to a fixed-width oscilloscope-style readout.
	const tStamp = phase.toFixed(2).padStart(7, "0");

	return (
		<div className="relative min-h-dvh w-full overflow-hidden bg-black text-white">
			{/* === SIGNATURE: the real animated RGB-split WebGL shader, behind everything === */}
			<WebGLShader />

			{/* Vignette + faint scanlines: read the shader as a CRT instrument display */}
			<div
				className="pointer-events-none fixed inset-0 z-[1]"
				style={{
					background:
						"radial-gradient(120% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.55) 100%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1] opacity-[0.12] mix-blend-soft-light"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 2px, transparent 4px)",
				}}
			/>

			{/* === Top instrument bar === */}
			<header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<div className="flex items-center gap-2.5">
					<Radio
						className="h-4 w-4 text-white/80 animate-signal-flicker"
						strokeWidth={1.6}
					/>
					<span className="tele text-white/85">
						CHROMA&nbsp;OSC&nbsp;/&nbsp;001
					</span>
				</div>
				<nav className="hidden items-center gap-7 sm:flex">
					<span className="tele text-white/45">CHANNELS</span>
					<span className="tele" style={{ color: "hsl(var(--sig-r))" }}>
						R
					</span>
					<span className="tele" style={{ color: "hsl(var(--sig-g))" }}>
						G
					</span>
					<span className="tele" style={{ color: "hsl(var(--sig-b))" }}>
						B
					</span>
				</nav>
				<Telemetry label="MODE" value="LIVE" />
			</header>

			{/* === The instrument card: the prompt's demo hero, framed === */}
			<main className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-24 sm:px-6">
				<div
					ref={cardRef}
					className="animate-bracket-in relative w-full max-w-3xl"
				>
					{/* hairline corner brackets */}
					<span className="bracket animate-bracket-in -left-px -top-px border-l border-t" />
					<span className="bracket animate-bracket-in -right-px -top-px border-r border-t" />
					<span className="bracket animate-bracket-in -bottom-px -left-px border-b border-l" />
					<span className="bracket animate-bracket-in -bottom-px -right-px border-b border-r" />

					{/* outer panel — keeps the demo's #27272a hairline doubled border */}
					<div className="relative border border-[#27272a] bg-black/35 p-2 backdrop-blur-[2px]">
						{/* scanning hairline that sweeps the panel like an oscilloscope trace */}
						<div className="pointer-events-none absolute inset-2 overflow-hidden">
							<div
								className="absolute inset-x-0 top-0 h-px opacity-60"
								style={{
									background:
										"linear-gradient(90deg, transparent, hsl(var(--sig-g) / 0.9), transparent)",
									animation: "scan-down 6.5s linear infinite",
								}}
							/>
						</div>

						<div className="relative overflow-hidden border border-[#27272a] px-6 py-12 sm:py-14">
							{/* inner top caption strip — true to the read-out vernacular */}
							<div className="mb-7 flex items-center justify-between">
								<span className="tele text-white/40">
									SIGNAL&nbsp;:&nbsp;SINE&nbsp;×3
								</span>
								<span className="tele text-white/40">DIST&nbsp;0.05</span>
							</div>

							{/* RGB-split headline — the shader's chromatic aberration, echoed in type */}
							<h1
								className="rgb-split animate-reveal-up mb-4 text-center font-display text-6xl font-bold leading-[0.92] tracking-tighter text-white sm:text-7xl md:text-[clamp(3.25rem,9vw,7rem)]"
								data-text="Design is Everything"
							>
								Design is Everything
							</h1>

							<p
								className="animate-reveal-up mx-auto max-w-xl px-2 text-center text-sm text-white/55 sm:text-base"
								style={{ animationDelay: "0.08s" }}
							>
								Unleashing creativity through bold visuals, seamless interfaces,
								and limitless possibilities — rendered live in a single GLSL
								pass.
							</p>

							{/* live status — the demo's pinging green dot, kept as the brand pulse */}
							<div
								className="animate-reveal-up my-9 flex items-center justify-center gap-2"
								style={{ animationDelay: "0.16s" }}
							>
								<span className="relative flex h-3 w-3 items-center justify-center">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
								</span>
								<span className="tele text-green-500">
									AVAILABLE&nbsp;FOR&nbsp;NEW&nbsp;PROJECTS
								</span>
							</div>

							<div
								className="animate-reveal-up flex justify-center"
								style={{ animationDelay: "0.24s" }}
							>
								<LiquidButton
									className="rounded-full border border-white/15 text-white"
									size="xl"
								>
									Let&apos;s Go
									<ArrowUpRight className="h-4 w-4" strokeWidth={2} />
								</LiquidButton>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* === Bottom telemetry strip — live frame rate + shader uptime === */}
			<footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<Telemetry label="T" value={`${tStamp}s`} />
				<div className="hidden items-center gap-6 sm:flex">
					<Telemetry label="GLSL" value="RAW · 1 PASS" />
					<Telemetry label="FRINGE" value="±0.018" />
				</div>
				<Telemetry label="FPS" value={String(fps).padStart(2, "0")} />
			</footer>
		</div>
	);
}
