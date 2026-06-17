import { ArrowUpRight, Grid2x2 } from "lucide-react";

const LINKS = [
	{ href: "#instrument", label: "Instrument" },
	{ href: "#deck", label: "Control deck" },
	{ href: "#anatomy", label: "Anatomy" },
	{ href: "#integrate", label: "Integrate" },
];

export function Footer() {
	return (
		<footer className="relative border-t border-[var(--line)] px-5 py-14 sm:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-10">
				<div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
					<div className="max-w-md">
						<a href="#top" className="flex items-center gap-2.5">
							<span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--navy)]">
								<Grid2x2 className="h-4 w-4 text-cobalt-bright" />
							</span>
							<span className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink">
								Gridline
							</span>
						</a>
						<p className="mt-4 font-body text-sm leading-relaxed text-ink-dim">
							A deep-navy WebGL2 blueprint grid with ASCII stamps — one drop-in{" "}
							<code className="code-chip">@/components/ui</code> file for any shadcn
							project.
						</p>
					</div>

					<nav className="flex flex-wrap gap-x-7 gap-y-2">
						{LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="font-mono text-xs uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-cobalt-bright"
							>
								{link.label}
							</a>
						))}
					</nav>
				</div>

				<div className="flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
					<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
						Specimen 01 · navy mesh grid · WebGL2
					</span>
					<a
						href="https://github.com/pulkitxm/claude-directory"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-cobalt-bright"
					>
						Built with Claude Fable 5 · claude-directory
						<ArrowUpRight className="h-3 w-3" />
					</a>
				</div>
			</div>
		</footer>
	);
}
