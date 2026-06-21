import { Binary, Grid3x3, Hash, Sparkles, SunDim, Waves } from "lucide-react";

import { Reveal } from "@/components/Reveal";

type Stage = {
	step: string;
	icon: typeof Hash;
	title: string;
	body: string;
	tag: string;
};

/**
 * Anatomy — reads the brief's `mainImage` top to bottom and presents each
 * compositing stage as a numbered card, so the page documents the exact order
 * in which a pixel is built.
 */
const STAGES: Stage[] = [
	{
		step: "00",
		icon: Sparkles,
		title: "Mesh-gradient base",
		body: "Four fixed navy/cobalt anchor points are inverse-distance weighted into a smooth four-corner wash — the deep base colour every later layer sits on.",
		tag: "meshGradient()",
	},
	{
		step: "01",
		icon: SunDim,
		title: "Wash + vignette",
		body: "A vertical deep→tint gradient is blended in, then a radial vignette darkens the edges so the centre reads as the focal plane of the instrument.",
		tag: "uMeshAmt · uVignetteAmt",
	},
	{
		step: "02",
		icon: Grid3x3,
		title: "Thin + major grid",
		body: "Two analytic, fwidth-antialiased line fields — a dense thin grid and a heavier major grid every few cells — are added over the base and drift along a fixed diagonal.",
		tag: "uGridScale · uMajorStep",
	},
	{
		step: "03",
		icon: Hash,
		title: "ASCII glyph stamps",
		body: "On every other major intersection a luma-driven glyph is stamped: dot → bar → cross → diagonals, picked from eight SDF primitives by the local brightness, like an ASCII art ramp.",
		tag: "asciiGlyph() · uAsciiAmt",
	},
	{
		step: "04",
		icon: Waves,
		title: "Value-noise grain",
		body: "A scrolling value-noise field is added at low amplitude, giving the flat GPU gradient a film-like organic shimmer that never bands.",
		tag: "vnoise() · uNoiseAmt",
	},
	{
		step: "05",
		icon: Binary,
		title: "Bayer dither + tanh",
		body: "A 4×4 ordered-dither matrix breaks up 8-bit banding (more in shadows, less in light), and a final tanh tone-map rolls the highlights off softly.",
		tag: "bayer4() · tanh()",
	},
];

export function Anatomy() {
	return (
		<section
			id="anatomy"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 max-w-2xl">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
						03 / anatomy
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
						How one pixel gets built.
					</h2>
					<p className="mt-4 font-body text-ink-dim">
						The fragment shader composites in a fixed order — every frame, for
						every pixel. Read top to bottom, it's the same sequence as the
						brief's{" "}
						<code className="rounded bg-[var(--navy)] px-1.5 py-0.5 font-mono text-xs text-cobalt-bright">
							mainImage()
						</code>
						.
					</p>
				</Reveal>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{STAGES.map((stage, i) => {
						const Icon = stage.icon;
						return (
							<Reveal key={stage.step} delay={i * 60}>
								<article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] p-6 backdrop-blur transition-colors hover:border-cobalt-bright/60">
									<div className="bp-grid pointer-events-none absolute inset-0 opacity-30" />
									<div className="relative flex items-center justify-between">
										<span className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--navy)] text-cobalt-bright transition-colors group-hover:text-cyan">
											<Icon className="h-4 w-4" />
										</span>
										<span className="font-mono text-3xl font-bold leading-none text-[var(--line-strong)] transition-colors group-hover:text-cobalt-bright/50">
											{stage.step}
										</span>
									</div>
									<h3 className="relative mt-5 font-display text-lg font-bold text-ink">
										{stage.title}
									</h3>
									<p className="relative mt-2 flex-1 font-body text-sm leading-relaxed text-ink-dim">
										{stage.body}
									</p>
									<span className="relative mt-4 inline-block w-fit rounded border border-[var(--line)] bg-[var(--navy)] px-2 py-1 font-mono text-[10px] tracking-[0.04em] text-cobalt-bright">
										{stage.tag}
									</span>
								</article>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
