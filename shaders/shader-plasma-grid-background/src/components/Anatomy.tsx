import type { LucideIcon } from "lucide-react";
import { CircleDot, Grid3x3, Layers, Spline, Waves, Zap } from "lucide-react";

import { Reveal } from "@/components/Reveal";

type Layer = {
	icon: LucideIcon;
	tag: string;
	title: string;
	body: string;
	code: string;
};

const LAYERS: Layer[] = [
	{
		icon: Layers,
		tag: "base",
		title: "Gradient base",
		body: "A left-to-right mix between two deep blues, multiplied by a vertical cosine fade so the edges fall into shadow.",
		code: "mix(bgColor1, bgColor2, uv.x)",
	},
	{
		icon: Spline,
		tag: "domain",
		title: "Domain warp",
		body: "Before anything is drawn, space itself is bent by a cheap 3-cosine noise — this is what makes the lines breathe instead of march.",
		code: "space.y += random(...) * warpAmplitude",
	},
	{
		icon: Waves,
		tag: "loop ×16",
		title: "Plasma lines",
		body: "Sixteen smooth + crisp line pairs, each with its own randomized width, offset and plasma curve. Layered additively into the violet accent.",
		code: "drawSmoothLine(pos, halfWidth, space.y)",
	},
	{
		icon: CircleDot,
		tag: "accent",
		title: "Travelling sparks",
		body: "A tiny circle rides along each line, wrapping every 25 units via mod() — the bright dots that drift across the field.",
		code: "drawCircle(circlePosition, 0.01, space)",
	},
	{
		icon: Grid3x3,
		tag: "helpers",
		title: "Grid primitives",
		body: "Reusable #define macros for circles, smooth lines, crisp lines and periodic lines — the toolkit the rest of the shader is assembled from.",
		code: "#define drawPeriodicLine(freq, w, t)",
	},
	{
		icon: Zap,
		tag: "cost",
		title: "One draw call",
		body: "A single full-screen TRIANGLE_STRIP of 4 vertices. All the motion lives in the fragment stage, fed by just iTime and iResolution.",
		code: "gl.drawArrays(TRIANGLE_STRIP, 0, 4)",
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
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-phosphor">
						02 / anatomy
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
						What's inside one fragment shader.
					</h2>
					<p className="mt-4 font-body text-ink-dim">
						The whole effect is ~90 lines of GLSL evaluated once per pixel. Read
						it top to bottom and each layer stacks onto the last.
					</p>
				</Reveal>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{LAYERS.map((layer, i) => (
						<Reveal as="article" key={layer.title} delay={i * 60}>
							<div className="group flex h-full flex-col rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] p-5 backdrop-blur transition-colors hover:border-violet">
								<div className="flex items-center justify-between">
									<span className="grid h-10 w-10 place-items-center rounded-md border border-[var(--line-strong)] bg-black/40 text-violet transition-colors group-hover:text-phosphor">
										<layer.icon className="h-5 w-5" strokeWidth={1.9} />
									</span>
									<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
										{layer.tag}
									</span>
								</div>
								<h3 className="mt-5 font-display text-lg font-semibold text-ink">
									{layer.title}
								</h3>
								<p className="mt-2 flex-1 font-body text-sm leading-relaxed text-ink-dim">
									{layer.body}
								</p>
								<code className="mt-4 block overflow-x-auto whitespace-nowrap rounded-md border border-[var(--line)] bg-black/40 px-3 py-2 font-mono text-[11px] text-phosphor/90">
									{layer.code}
								</code>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
