import { DitheringStage } from "@/components/DitheringStage";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/useReveal";
import { SHAPES, type Params } from "@/lib/dithering";
import type { DitheringShape } from "@/components/ui/dithering-shader";

type ShapeGalleryProps = {
	params: Params;
	onSelect: (shape: DitheringShape) => void;
};

function ShapeTile({
	shape,
	label,
	blurb,
	params,
	active,
	onSelect,
}: {
	shape: DitheringShape;
	label: string;
	blurb: string;
	params: Params;
	active: boolean;
	onSelect: () => void;
}) {
	// Lazy-mount the WebGL context only once the tile scrolls into view, so the
	// page never holds more shader contexts than it's actually showing.
	const { ref, shown } = useReveal<HTMLButtonElement>(0.25);

	return (
		<button
			ref={ref}
			type="button"
			data-testid={`gallery-${shape}`}
			aria-pressed={active}
			onClick={onSelect}
			className={[
				"group relative overflow-hidden rounded-xl border text-left transition-colors",
				active
					? "border-[var(--rose-line)] ring-1 ring-rose/40"
					: "border-[var(--line-strong)] hover:border-[var(--rose-line)]",
			].join(" ")}
		>
			<div className="aspect-[4/3] w-full bg-ink-2">
				{shown ? (
					<DitheringStage
						params={{ ...params, shape }}
						maxSize={420}
						className="h-full w-full"
					/>
				) : (
					<div className="dither-veil h-full w-full" />
				)}
			</div>
			<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent px-4 pb-3 pt-8">
				<div className="flex items-center justify-between">
					<span className="font-display text-sm font-bold text-paper">
						{label}
					</span>
					{active && (
						<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">
							● active
						</span>
					)}
				</div>
				<p className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-paper-dim">
					{blurb}
				</p>
			</div>
		</button>
	);
}

export function ShapeGallery({ params, onSelect }: ShapeGalleryProps) {
	return (
		<section
			id="shapes"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="max-w-2xl">
						<span className="font-mono text-xs uppercase tracking-[0.2em] text-rose">
							03 / shape index
						</span>
						<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-paper">
							Seven fields, one shader.
						</h2>
						<p className="mt-4 font-body text-paper-dim">
							The <code className="font-mono text-paper">shape</code> prop swaps
							the procedural field inside the same draw call. Every tile below
							runs your current dither, colours and pixel size — tap one to make
							it the hero.
						</p>
					</div>
				</Reveal>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SHAPES.map((s, i) => (
						<Reveal key={s.key} delay={i * 50}>
							<ShapeTile
								shape={s.key}
								label={s.label}
								blurb={s.blurb}
								params={params}
								active={params.shape === s.key}
								onSelect={() => onSelect(s.key)}
							/>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
