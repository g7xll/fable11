import { Activity, Github, Waves, Zap } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import ElectricWavesShader from "@/components/ui/colorful-wave-pattern-1";

/**
 * ARCWAVE — a signal instrument built around the prompt's ElectricWavesShader.
 *
 * The verbatim component paints a fixed, full-viewport WebGL canvas (z-index -1)
 * and ships its own slider deck (bottom-center). This surface frames that output
 * as a piece of test equipment: viewfinder brackets, CRT scanlines, a sweeping
 * scope line, and the signature element — a live telemetry HUD fed from our own
 * rAF loop, kept out of React state so it never re-renders the tree at 60fps.
 * Chrome is positioned to leave the component's native control deck untouched.
 */
export default function App() {
	const fpsRef = useRef<HTMLSpanElement | null>(null);
	const timeRef = useRef<HTMLSpanElement | null>(null);
	const resRef = useRef<HTMLSpanElement | null>(null);
	const barRef = useRef<HTMLSpanElement | null>(null);

	// Live telemetry — the prompt's component exposes no timing, so we run a tiny
	// independent rAF loop purely to drive the HUD, writing straight to DOM refs.
	useEffect(() => {
		let raf = 0;
		let frames = 0;
		let last = performance.now();
		const start = last;
		const tick = () => {
			frames += 1;
			const now = performance.now();
			if (now - last >= 500) {
				const fps = Math.round((frames * 1000) / (now - last));
				frames = 0;
				last = now;
				if (fpsRef.current)
					fpsRef.current.textContent = String(fps).padStart(2, "0");
				if (barRef.current)
					barRef.current.style.width = `${Math.min(100, (fps / 60) * 100)}%`;
			}
			if (timeRef.current)
				timeRef.current.textContent = ((now - start) / 1000)
					.toFixed(1)
					.padStart(5, "0");
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	// Drawing-buffer resolution readout, updated with the window.
	useEffect(() => {
		const setRes = () => {
			if (resRef.current)
				resRef.current.textContent = `${window.innerWidth}×${window.innerHeight}`;
		};
		setRes();
		window.addEventListener("resize", setRes);
		return () => window.removeEventListener("resize", setRes);
	}, []);

	return (
		<main className="relative h-screen w-screen overflow-hidden bg-ink text-paper">
			{/* The prompt's component, verbatim: fixed full-viewport canvas + slider deck. */}
			<ElectricWavesShader />

			{/* CRT scanlines + a sweeping scope line read the canvas as an instrument. */}
			<div
				aria-hidden
				className="scanlines pointer-events-none fixed inset-0 z-[1]"
			/>
			<div
				aria-hidden
				className="scan-sweep pointer-events-none fixed inset-x-0 top-0 z-[1] h-24"
			/>

			{/* Vignette so the chrome stays legible over bright electric bursts. */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1]"
				style={{
					background:
						"radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(4,6,10,0.72) 100%)",
				}}
			/>

			{/* Viewfinder corner brackets. */}
			<div aria-hidden className="pointer-events-none fixed inset-5 z-[2]">
				<div className="bracket bracket-tl absolute left-0 top-0 h-4 w-4" />
				<div className="bracket bracket-tr absolute right-0 top-0 h-4 w-4" />
				<div className="bracket bracket-bl absolute bottom-0 left-0 h-4 w-4" />
				<div className="bracket bracket-br absolute bottom-0 right-0 h-4 w-4" />
			</div>

			{/* ── Top bar ──────────────────────────────────────────────────────── */}
			<header className="animate-rise fixed inset-x-0 top-0 z-10 flex items-center justify-between px-7 py-6 sm:px-10">
				<div className="flex items-center gap-3">
					<span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-glass backdrop-blur">
						<Zap className="h-4 w-4 text-volt" />
					</span>
					<div className="leading-none">
						<p className="grad-text font-display text-lg font-bold tracking-tight">
							ARCWAVE
						</p>
						<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.34em] text-haze">
							Signal Instrument
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-haze sm:flex">
						<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
						Live · GPU
					</span>
					<a
						href="https://github.com"
						target="_blank"
						rel="noreferrer noopener"
						aria-label="View source on GitHub"
						className="grid h-8 w-8 place-items-center rounded-md border border-line bg-glass text-haze backdrop-blur transition-colors hover:text-paper"
					>
						<Github className="h-4 w-4" />
					</a>
				</div>
			</header>

			{/* ── Hero lockup: the shader is the subject ───────────────────────── */}
			<section className="pointer-events-none fixed left-7 top-24 z-10 max-w-xl sm:left-10 sm:top-1/2 sm:-translate-y-1/2">
				<p className="animate-rise flex items-center gap-2 font-mono text-xs uppercase tracking-[0.32em] text-haze [animation-delay:120ms]">
					<Waves className="h-3.5 w-3.5 text-volt" />
					GLSL · additive RGB field
				</p>
				<h1 className="animate-rise mt-4 font-display text-[clamp(2.5rem,7vw,5.25rem)] font-bold leading-[0.95] tracking-tight [animation-delay:200ms]">
					Electric waves,
					<br />
					<span className="grad-text">drawn on the GPU.</span>
				</h1>
				<p className="animate-rise mt-5 hidden max-w-md text-sm leading-relaxed text-haze [animation-delay:300ms] sm:block sm:text-base">
					Stacked sine fields fold across one full-screen quad and pile into the
					red, green and blue channels — additive interference, no textures, no
					video. Tune the field from the deck below.
				</p>
			</section>

			{/* ── Signature: live telemetry HUD off our render loop ────────────── */}
			<aside className="animate-rise fixed bottom-7 right-7 z-10 hidden w-[230px] [animation-delay:420ms] lg:block">
				<div className="rounded-2xl border border-line bg-glass p-5 backdrop-blur-xl">
					<div className="flex items-center gap-2">
						<Activity className="h-3.5 w-3.5 text-magenta" />
						<p className="font-mono text-[10px] uppercase tracking-[0.28em] text-haze">
							Telemetry
						</p>
					</div>

					<dl className="mt-4 space-y-2.5 font-mono text-xs">
						<Readout k="fps">
							<span ref={fpsRef} className="tabular-nums text-paper">
								00
							</span>
						</Readout>
						<Readout k="uptime">
							<span className="tabular-nums text-paper">
								<span ref={timeRef}>000.0</span>s
							</span>
						</Readout>
						<Readout k="res">
							<span ref={resRef} className="tabular-nums text-paper">
								—
							</span>
						</Readout>
						<Readout k="channels">
							<span className="tabular-nums font-bold">
								<span className="text-magenta">R</span>{" "}
								<span className="text-acid">G</span>{" "}
								<span className="text-volt">B</span>
							</span>
						</Readout>
					</dl>

					<div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
						<span
							ref={barRef}
							className="block h-full rounded-full bg-gradient-to-r from-volt via-acid to-magenta"
							style={{ width: "0%" }}
						/>
					</div>
				</div>
			</aside>
		</main>
	);
}

function Readout({ k, children }: { k: string; children: ReactNode }) {
	return (
		<div className="flex items-baseline justify-between">
			<dt className="uppercase tracking-[0.2em] text-haze">{k}</dt>
			<dd>{children}</dd>
		</div>
	);
}
