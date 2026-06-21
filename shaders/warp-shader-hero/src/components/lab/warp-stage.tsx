import { Warp } from "@paper-design/shaders-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { warpProps, type WarpConfig } from "@/lib/warp";

/**
 * WarpStage — the same `@paper-design/shaders-react` <Warp> element from the
 * prompt's `wrap-shader.tsx`, but with every prop lifted to a `config` object so
 * the lab's control deck can drive it live. The overlay content (eyebrow,
 * headline, paragraph, dual CTAs) is the prompt's hero, lightly elevated with a
 * vignette + readability scrim so the copy stays legible across every preset.
 *
 * The verbatim, unmodified component still lives at
 * `@/components/ui/wrap-shader.tsx`; this is the documentation/instrument view.
 */
export function WarpStage({
	config,
	className,
	frozen = false,
	compact = false,
}: {
	config: WarpConfig;
	className?: string;
	/** When true, the shader clock is held by forcing speed to 0. */
	frozen?: boolean;
	/** Compact = tighter type/padding for the in-scope lab preview. */
	compact?: boolean;
}) {
	const props = warpProps(config);

	return (
		<main className={cn("relative h-full w-full overflow-hidden", className)}>
			{/* Live shader field */}
			<div className="absolute inset-0">
				<Warp
					style={{ height: "100%", width: "100%" }}
					{...props}
					speed={frozen ? 0 : props.speed}
				/>
			</div>

			{/* Readability scrim — a soft radial + bottom gradient so white copy
			    holds up over the brightest aqua bands without hiding the shader. */}
			<div
				aria-hidden
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 95% at 50% 42%, rgba(2,8,12,0.10) 0%, rgba(2,8,12,0.46) 58%, rgba(2,8,12,0.74) 100%)",
				}}
			/>

			{/* Hero copy — the prompt's content */}
			<div
				className={cn(
					"relative z-10 h-full w-full flex items-center justify-center",
					compact ? "px-6" : "px-8",
				)}
			>
				<div
					className={cn(
						"w-full text-center",
						compact ? "max-w-2xl space-y-5" : "max-w-4xl space-y-8",
					)}
				>
					<div
						className="rise flex items-center justify-center"
						style={{ animationDelay: "40ms" }}
					>
						<span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
							<Sparkles className="h-3.5 w-3.5" />
							Paper Design · Warp
						</span>
					</div>

					<h1
						className={cn(
							"rise text-white font-sans font-light text-balance text-glow",
							compact ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl",
						)}
						style={{ animationDelay: "120ms" }}
					>
						Elegant Shader Backgrounds
					</h1>

					<p
						className={cn(
							"rise text-white/90 font-sans font-light leading-relaxed mx-auto",
							compact
								? "text-base md:text-lg max-w-xl"
								: "text-xl md:text-2xl max-w-3xl",
						)}
						style={{ animationDelay: "200ms" }}
					>
						Beautiful, performant shader effects that enhance your content
						without overwhelming it. Perfect for hero sections, landing pages,
						and modern web experiences.
					</p>

					<div
						className="rise flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
						style={{ animationDelay: "280ms" }}
					>
						<button
							className={cn(
								"group inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 font-medium text-white transition-all duration-300 hover:bg-white/30 hover:scale-105",
								compact ? "px-6 py-3 text-sm" : "px-8 py-4",
							)}
						>
							Get Started
							<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
						</button>
						<button
							className={cn(
								"rounded-full bg-white font-medium text-gray-800 transition-transform duration-300 hover:scale-105",
								compact ? "px-6 py-3 text-sm" : "px-8 py-4",
							)}
						>
							View Examples
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
