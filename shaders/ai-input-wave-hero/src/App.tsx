import { useEffect, useRef, useState } from "react";
import { ShowcaseSections } from "@/components/showcase-sections";
import { HeroWave } from "@/components/ui/ai-input-hero";

/**
 * Demo / showcase for the reusable <HeroWave /> shader hero.
 *
 * The prompt's `demo.tsx` is simply `return <HeroWave />`; this App keeps that
 * canonical above-the-fold (default title/subtitle, the component's own typing
 * placeholder and cursor-reactive wavefield) and frames it as a real product
 * page — a live FPS/uptime HUD over the canvas, a last-submitted toast wired to
 * `onPromptSubmit`, and the shadcn / Tailwind / TypeScript integration story
 * below the fold.
 */
export default function App() {
	const [lastPrompt, setLastPrompt] = useState<string | null>(null);
	const toastTimer = useRef<number | null>(null);

	// Lightweight rAF FPS / uptime meter for the corner HUD. Purely observational
	// — it never touches the shader, so the verbatim component stays untouched.
	const [fps, setFps] = useState(0);
	const [uptime, setUptime] = useState(0);

	useEffect(() => {
		let raf = 0;
		let frames = 0;
		let last = performance.now();
		const start = last;
		const loop = (now: number) => {
			frames++;
			if (now - last >= 500) {
				setFps(Math.round((frames * 1000) / (now - last)));
				frames = 0;
				last = now;
			}
			setUptime((now - start) / 1000);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);

	const handleSubmit = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) return;
		setLastPrompt(trimmed);
		if (toastTimer.current) window.clearTimeout(toastTimer.current);
		toastTimer.current = window.setTimeout(() => setLastPrompt(null), 4200);
	};

	return (
		<div className="grain relative w-full bg-ink text-white">
			{/* Above the fold: the verbatim HeroWave with a live HUD + submit toast. */}
			<div className="relative">
				<HeroWave
					title="Build with AI."
					subtitle="The AI Fullstack Engineer. Build prototypes, apps, and websites."
					onPromptSubmit={handleSubmit}
				/>

				{/* Live telemetry HUD — reads its own rAF clock, mirrors the shaders-folder
            house style without reaching into the component. */}
				<div className="pointer-events-none absolute right-4 top-24 z-[30] hidden flex-col items-end gap-1 font-mono text-[11px] tracking-tight text-cobalt-300/90 sm:flex">
					<div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
						<span className="hud-live-dot h-1.5 w-1.5 rounded-full bg-cobalt-400" />
						<span className="text-white/70">render</span>
						<span className="tabular-nums text-white">{fps} fps</span>
					</div>
					<div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 tabular-nums text-white/70 backdrop-blur-md">
						uptime {uptime.toFixed(1)}s
					</div>
				</div>

				{/* Brand mark, bottom-left, so the hero reads as a shipped site. */}
				<div className="pointer-events-none absolute bottom-6 left-6 z-[30] hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/45 sm:flex">
					<span className="text-cobalt-400">▮▮▮</span> wavelength
				</div>

				{/* onPromptSubmit toast. */}
				<div
					className={`pointer-events-none absolute bottom-8 left-1/2 z-[40] w-[min(92vw,560px)] -translate-x-1/2 transition-all duration-300 ${
						lastPrompt ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
					}`}
					aria-live="polite"
				>
					{lastPrompt && (
						<div className="flex items-center gap-3 rounded-2xl border border-cobalt-300/30 bg-black/70 px-4 py-3 backdrop-blur-md">
							<span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cobalt/20 text-xs text-cobalt-300 ring-1 ring-inset ring-cobalt-300/30">
								↗
							</span>
							<p className="truncate text-sm text-white/90">
								<span className="text-mist">Generating</span> &ldquo;
								{lastPrompt}&rdquo;
							</p>
						</div>
					)}
				</div>
			</div>

			<ShowcaseSections />
		</div>
	);
}
