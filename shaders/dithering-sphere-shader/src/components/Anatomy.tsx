import { Maximize2, MousePointerClick, Palette } from "lucide-react";

import { Reveal } from "@/components/Reveal";

type PropRow = {
	prop: string;
	type: string;
	def: string;
	note: string;
};

const PROPS: PropRow[] = [
	{ prop: "shape", type: `"sphere" | "ripple" | …`, def: `"simplex"`, note: "Which procedural field to draw (7 options)." },
	{ prop: "type", type: `"random" | "2x2" | "4x4" | "8x8"`, def: `"8x8"`, note: "Dithering algorithm — stochastic or ordered Bayer." },
	{ prop: "colorFront", type: "string (hex)", def: `"#ffffff"`, note: "The “on” colour after thresholding." },
	{ prop: "colorBack", type: "string (hex)", def: `"#000000"`, note: "The “off” colour; alpha is derived from it." },
	{ prop: "pxSize", type: "number", def: "4", note: "Pixelisation block size — bigger = chunkier." },
	{ prop: "speed", type: "number", def: "1", note: "Animation time multiplier. 0 freezes the frame." },
	{ prop: "width / height", type: "number", def: "800", note: "Canvas resolution in px. The stage wrapper measures these for you." },
	{ prop: "className / style", type: "—", def: "—", note: "Forwarded straight to the wrapper element." },
];

const NOTES = [
	{
		icon: MousePointerClick,
		title: "State & data",
		body: "The component is fully controlled by props — no context, no store, no required providers. Lift a single params object into your page (as the deck does) and every instance stays in sync.",
	},
	{
		icon: Maximize2,
		title: "Responsive behaviour",
		body: "The brief's component renders at fixed width/height. DitheringStage wraps it in a ResizeObserver and feeds the measured size, so the same shader fills a hero, a card, or a thumbnail with no layout maths.",
	},
	{
		icon: Palette,
		title: "Assets & icons",
		body: "Zero image assets — the visual is 100% generated on the GPU. The only externals are lucide-react icons for the chrome and locally-vendored fonts, so it runs fully offline.",
	},
];

export function Anatomy() {
	return (
		<section id="anatomy" className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 max-w-2xl">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-rose">
						04 / anatomy
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-paper">
						The whole API, on one screen.
					</h2>
					<p className="mt-4 font-body text-paper-dim">
						Eight props, no required context, no peer setup beyond React. Here's every
						knob the component exposes and how the showcase answers the integration
						questions.
					</p>
				</Reveal>

				<div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
					<Reveal className="panel overflow-hidden rounded-xl">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left">
								<thead>
									<tr className="border-b border-[var(--line-strong)] font-mono text-[10px] uppercase tracking-[0.16em] text-paper-faint">
										<th className="px-4 py-3 font-medium">Prop</th>
										<th className="px-4 py-3 font-medium">Type</th>
										<th className="px-4 py-3 font-medium">Default</th>
									</tr>
								</thead>
								<tbody>
									{PROPS.map((p) => (
										<tr
											key={p.prop}
											className="border-b border-[var(--line)] align-top last:border-0"
										>
											<td className="px-4 py-3 font-mono text-xs font-bold text-rose">
												{p.prop}
											</td>
											<td className="px-4 py-3">
												<div className="font-mono text-xs text-paper">{p.type}</div>
												<div className="mt-1 font-body text-[11px] leading-snug text-paper-faint">
													{p.note}
												</div>
											</td>
											<td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-paper-dim">
												{p.def}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Reveal>

					<div className="flex flex-col gap-4">
						{NOTES.map((n, i) => (
							<Reveal key={n.title} delay={i * 70}>
								<div className="panel flex h-full gap-4 rounded-xl p-5">
									<div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--rose-line)] bg-rose/10">
										<n.icon className="h-4 w-4 text-rose" />
									</div>
									<div>
										<h3 className="font-display text-sm font-bold text-paper">
											{n.title}
										</h3>
										<p className="mt-1.5 font-body text-[13px] leading-relaxed text-paper-dim">
											{n.body}
										</p>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
