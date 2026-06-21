import { Moon, Sun, Waves } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";

/**
 * Showcase page for the verbatim `DottedSurface` component.
 *
 * The component itself renders a full-viewport three.js `Points` lattice
 * (40 x 60 dots) whose Y is driven by two crossing sine waves. Everything else
 * in this file is the surrounding "field generator" chrome — a brand lockup, a
 * theme toggle that flips `next-themes` so a viewer sees both the dark (light
 * dots) and light (dark dots) palettes, the spec'd centred heading + radial
 * glow, and a thin telemetry footer. The surface is `pointer-events-none` and
 * sits behind, so this UI layers on top with its own pointer events.
 */
export default function App() {
	// `next-themes` only knows the resolved theme after mount; gate theme-dependent
	// UI on a mounted flag to avoid a hydration/first-paint flash on the icon.
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme !== "light"; // default + SSR-ish guard -> dark
	const toggle = () => setTheme(isDark ? "light" : "dark");

	return (
		<div
			className={cn(
				// NOTE: intentionally NO opaque background here. The verbatim component
				// renders its canvas at `z-index:-1` (its `-z-1` class). The page
				// background therefore lives on <body> (see index.css); if this wrapper
				// painted a solid colour the negative-z canvas would be hidden behind it.
				"relative min-h-screen w-full overflow-hidden transition-colors duration-700",
				isDark ? "text-zinc-100" : "text-zinc-900",
			)}
		>
			{/* ---- The component under test: full-viewport animated dotted surface ---- */}
			<DottedSurface className="size-full" />

			{/* Theme-aware vignette/scrim. Layered ABOVE the canvas (z:0) but BELOW the
          content (z:10): fully transparent through the centre band so the wave
          reads, only darkening toward the edges to seat the header/footer. Kept
          light so the dotted field stays the hero. */}
			<div
				aria-hidden
				className={cn(
					"pointer-events-none fixed inset-0 z-0 transition-opacity duration-700",
					isDark ? "opacity-100" : "opacity-90",
				)}
				style={{
					background: isDark
						? "radial-gradient(135% 105% at 50% 30%, transparent 0%, transparent 58%, rgba(6,7,11,0.35) 84%, rgba(6,7,11,0.72) 100%)"
						: "radial-gradient(135% 105% at 50% 30%, transparent 0%, transparent 60%, rgba(244,244,245,0.4) 84%, rgba(244,244,245,0.78) 100%)",
				}}
			/>

			{/* ---- Foreground UI ---- */}
			<div className="relative z-10 flex min-h-screen flex-col">
				{/* Top bar */}
				<header className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-7">
					<div className="flex items-center gap-3">
						<span
							className={cn(
								"grid size-9 place-items-center rounded-lg border backdrop-blur-sm transition-colors",
								isDark
									? "border-white/12 bg-white/[0.04] text-zinc-200"
									: "border-black/10 bg-black/[0.03] text-zinc-700",
							)}
						>
							<Waves className="size-[18px]" strokeWidth={1.6} />
						</span>
						<div className="leading-tight">
							<p className="font-mono text-[13px] font-semibold tracking-[0.18em]">
								DOTTED SURFACE
							</p>
							<p
								className={cn(
									"font-mono text-[10px] tracking-[0.32em]",
									isDark ? "text-zinc-500" : "text-zinc-500",
								)}
							>
								FIELD GENERATOR
							</p>
						</div>
					</div>

					<ThemeToggle mounted={mounted} isDark={isDark} onToggle={toggle} />
				</header>

				{/* Centre lockup */}
				<main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
					{/* Spec'd soft radial glow behind the heading */}
					<div
						aria-hidden="true"
						className={cn(
							"pointer-events-none absolute left-1/2 top-1/2 size-[42rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] transition-opacity duration-700",
							isDark ? "opacity-100" : "opacity-70",
						)}
						style={{
							background: isDark
								? "radial-gradient(ellipse at center, rgba(238,242,255,0.10), transparent 60%)"
								: "radial-gradient(ellipse at center, rgba(9,9,11,0.08), transparent 60%)",
						}}
					/>

					<span
						className={cn(
							"mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] backdrop-blur-sm transition-colors",
							isDark
								? "border-white/12 bg-white/[0.03] text-zinc-400"
								: "border-black/10 bg-black/[0.03] text-zinc-500",
						)}
					>
						<span
							className={cn(
								"size-1.5 rounded-full",
								isDark ? "bg-emerald-300" : "bg-emerald-600",
							)}
						/>
						THREE.JS · 2,400 POINTS · SINE FIELD
					</span>

					<h1 className="relative font-mono text-5xl font-semibold tracking-tight sm:text-7xl">
						Dotted Surface
					</h1>

					<p
						className={cn(
							"relative mt-6 max-w-md text-pretty text-sm leading-relaxed sm:text-base",
							isDark ? "text-zinc-400" : "text-zinc-600",
						)}
					>
						A breathing lattice of points, displaced by two crossing sine waves
						and rendered live with three.js. Flip the theme to swap the palette
						in real time.
					</p>
				</main>

				{/* Footer telemetry */}
				<footer
					className={cn(
						"flex flex-col gap-3 px-6 py-5 font-mono text-[10px] tracking-[0.22em] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-7",
						isDark ? "text-zinc-500" : "text-zinc-500",
					)}
				>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
						<Stat label="LATTICE" value="40 × 60" isDark={isDark} />
						<Stat label="SEPARATION" value="150u" isDark={isDark} />
						<Stat
							label="PALETTE"
							value={mounted ? (isDark ? "LIGHT DOTS" : "DARK DOTS") : "—"}
							isDark={isDark}
						/>
					</div>
					<p className="opacity-80">@/COMPONENTS/UI/DOTTED-SURFACE</p>
				</footer>
			</div>
		</div>
	);
}

function ThemeToggle({
	mounted,
	isDark,
	onToggle,
}: {
	mounted: boolean;
	isDark: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label="Toggle colour theme"
			aria-pressed={isDark}
			className={cn(
				"pointer-events-auto group inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 font-mono text-[11px] tracking-[0.18em] backdrop-blur-sm transition-colors",
				isDark
					? "border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:bg-white/[0.08]"
					: "border-black/10 bg-black/[0.04] text-zinc-700 hover:border-black/20 hover:bg-black/[0.08]",
			)}
		>
			<span className="relative grid size-4 place-items-center">
				{/* Render a stable icon until mounted to avoid a hydration flash. */}
				{mounted && !isDark ? (
					<Moon className="size-4" strokeWidth={1.7} />
				) : (
					<Sun className="size-4" strokeWidth={1.7} />
				)}
			</span>
			<span>{mounted ? (isDark ? "DARK" : "LIGHT") : "THEME"}</span>
		</button>
	);
}

function Stat({
	label,
	value,
	isDark,
}: {
	label: string;
	value: string;
	isDark: boolean;
}) {
	return (
		<span className="inline-flex items-center gap-2">
			<span className="opacity-60">{label}</span>
			<span className={isDark ? "text-zinc-300" : "text-zinc-800"}>
				{value}
			</span>
		</span>
	);
}
