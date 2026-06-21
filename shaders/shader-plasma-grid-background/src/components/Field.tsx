import { Quote } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import avatar1 from "../../assets/avatar-1.jpg";
import avatar2 from "../../assets/avatar-2.jpg";
import avatar3 from "../../assets/avatar-3.jpg";
import galleryAurora from "../../assets/gallery-aurora.jpg";
import galleryGrid from "../../assets/gallery-grid.jpg";
import galleryNeon from "../../assets/gallery-neon.jpg";

const SHOTS = [
	{
		src: galleryAurora,
		alt: "Aurora-toned product hero using the shader as a backdrop",
		label: "Auth screen",
		note: "Login card floating over the field",
	},
	{
		src: galleryNeon,
		alt: "Neon dashboard concept lit by the violet plasma background",
		label: "Launch page",
		note: "Waitlist hero, hue shifted warm",
	},
	{
		src: galleryGrid,
		alt: "Grid-led developer landing page using the shader",
		label: "Docs cover",
		note: "Section divider, scale dialed up",
	},
];

export function Field() {
	return (
		<section
			id="field"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 max-w-2xl">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-phosphor">
						04 / in the field
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
						Where teams have dropped it.
					</h2>
					<p className="mt-4 font-body text-ink-dim">
						The same file, recoloured per brand. A quiet hero backdrop on one
						site, a loud launch page on the next.
					</p>
				</Reveal>

				<div className="grid gap-4 sm:grid-cols-3">
					{SHOTS.map((shot, i) => (
						<Reveal key={shot.label} delay={i * 70}>
							<figure className="group overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)]">
								<div className="relative aspect-[4/3] overflow-hidden">
									<img
										src={shot.src}
										alt={shot.alt}
										loading="lazy"
										className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-[var(--void)] via-transparent to-transparent" />
								</div>
								<figcaption className="flex items-center justify-between px-4 py-3">
									<span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink">
										{shot.label}
									</span>
									<span className="font-mono text-[10px] text-ink-faint">
										{shot.note}
									</span>
								</figcaption>
							</figure>
						</Reveal>
					))}
				</div>

				{/* testimonial */}
				<Reveal className="mt-10">
					<figure className="panel relative overflow-hidden rounded-xl p-7 sm:p-10">
						<Quote className="absolute right-6 top-6 h-12 w-12 text-violet/15" />
						<blockquote className="max-w-3xl font-display text-xl font-medium leading-snug text-ink sm:text-2xl">
							"We'd been reaching for a heavy 3D library just to get an animated
							hero. This was a single file, one draw call, and it ran at 60fps
							on a three-year-old laptop. We deleted 40kb of dependencies."
						</blockquote>
						<figcaption className="mt-7 flex items-center gap-4">
							<div className="flex -space-x-3">
								{[avatar1, avatar2, avatar3].map((src, i) => (
									<img
										key={i}
										src={src}
										alt=""
										aria-hidden="true"
										className="h-10 w-10 rounded-full border-2 border-[var(--void)] object-cover"
									/>
								))}
							</div>
							<div>
								<div className="font-body text-sm font-semibold text-ink">
									Mara Okonkwo
								</div>
								<div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
									frontend lead · vector studio
								</div>
							</div>
						</figcaption>
					</figure>
				</Reveal>
			</div>
		</section>
	);
}
