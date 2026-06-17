import { ArrowUpRight, Waves } from "lucide-react";

export function Footer() {
	return (
		<footer className="relative border-t border-[var(--line)] px-5 py-14 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
					<div className="max-w-sm">
						<div className="flex items-center gap-2.5">
							<span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-solid)] text-violet">
								<Waves className="h-4 w-4" strokeWidth={2.2} />
							</span>
							<span className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
								PLASMA<span className="text-violet">SIGNAL</span>
							</span>
						</div>
						<p className="mt-4 font-body text-sm leading-relaxed text-ink-dim">
							A WebGL plasma-grid background for shadcn/ui. One file, one draw call,
							no dependencies — recolour it and ship it.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-x-12 gap-y-2 font-mono text-sm">
						<a
							href="#deck"
							className="group flex items-center gap-1 text-ink-dim hover:text-ink"
						>
							Control deck
							<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
						</a>
						<a
							href="#anatomy"
							className="group flex items-center gap-1 text-ink-dim hover:text-ink"
						>
							Anatomy
							<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
						</a>
						<a
							href="#install"
							className="group flex items-center gap-1 text-ink-dim hover:text-ink"
						>
							Install
							<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
						</a>
						<a
							href="#field"
							className="group flex items-center gap-1 text-ink-dim hover:text-ink"
						>
							In the field
							<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
						</a>
					</div>
				</div>

				<div className="mt-12 flex flex-col gap-3 border-t border-[var(--line)] pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
					<span>shader-background.tsx · webgl · mit-spirited demo</span>
					<span>
						built with fable 5 · imagery from{" "}
						<a
							href="https://unsplash.com"
							className="text-ink-dim hover:text-ink"
							rel="noreferrer"
							target="_blank"
						>
							unsplash
						</a>
					</span>
				</div>
			</div>
		</footer>
	);
}
