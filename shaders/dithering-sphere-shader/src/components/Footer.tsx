export function Footer() {
	return (
		<footer className="relative border-t border-[var(--line)] px-5 py-12 sm:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2.5">
					<span
						aria-hidden="true"
						className="grid h-6 w-6 place-items-center rounded-[5px] bg-rose"
					>
						<span className="grid grid-cols-2 grid-rows-2 gap-[2px]">
							<span className="h-1 w-1 bg-ink" />
							<span className="h-1 w-1 bg-ink/30" />
							<span className="h-1 w-1 bg-ink/30" />
							<span className="h-1 w-1 bg-ink" />
						</span>
					</span>
					<span className="font-display text-sm font-bold text-paper">
						DITHER<span className="text-rose">LAB</span>
					</span>
				</div>

				<p className="max-w-md font-body text-[13px] leading-relaxed text-paper-faint">
					A Claude Fable 5 experiment integrating the{" "}
					<span className="text-paper-dim">designali-in/dithering-shader</span> component
					into a shadcn-structured Vite + TypeScript + Tailwind app. The visual is one
					WebGL2 fragment shader; fonts are vendored locally, so it runs offline.
				</p>

				<a
					href="#top"
					className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim transition-colors hover:text-rose"
				>
					Back to top ↑
				</a>
			</div>
		</footer>
	);
}
