import { Github } from "lucide-react";

const LINKS = [
	{ href: "#deck", label: "Deck" },
	{ href: "#shapes", label: "Shapes" },
	{ href: "#matrix", label: "Matrix" },
	{ href: "#install", label: "Install" },
];

export function Nav() {
	return (
		<header className="fixed inset-x-0 top-0 z-50">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
				<a
					href="#top"
					className="group flex items-center gap-2.5 font-display text-sm font-bold tracking-[-0.01em] text-paper"
				>
					<span
						aria-hidden="true"
						className="grid h-6 w-6 place-items-center rounded-[5px] bg-rose shadow-[0_0_18px_rgba(244,63,94,0.6)]"
					>
						<span className="grid grid-cols-2 grid-rows-2 gap-[2px]">
							<span className="h-1 w-1 bg-ink" />
							<span className="h-1 w-1 bg-ink/30" />
							<span className="h-1 w-1 bg-ink/30" />
							<span className="h-1 w-1 bg-ink" />
						</span>
					</span>
					DITHER<span className="text-rose">LAB</span>
				</a>

				<nav className="hidden items-center gap-7 md:flex">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="font-mono text-xs uppercase tracking-[0.16em] text-paper-dim transition-colors hover:text-paper"
						>
							{l.label}
						</a>
					))}
				</nav>

				<a
					href="#install"
					className="inline-flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-paper backdrop-blur transition-colors hover:border-[var(--rose-line)] hover:text-rose"
				>
					<Github className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">components/ui</span>
				</a>
			</div>
		</header>
	);
}
