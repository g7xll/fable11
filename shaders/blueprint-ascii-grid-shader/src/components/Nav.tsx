import { useEffect, useState } from "react";
import { Github, Grid2x2 } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "#instrument", label: "Instrument" },
	{ href: "#deck", label: "Control deck" },
	{ href: "#anatomy", label: "Anatomy" },
	{ href: "#integrate", label: "Integrate" },
];

export function Nav() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
			<nav
				className={cn(
					"pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-300 sm:px-5",
					scrolled
						? "panel shadow-[0_18px_60px_-30px_rgba(0,0,0,0.9)]"
						: "border border-transparent bg-transparent",
				)}
			>
				<a
					href="#top"
					className="group flex items-center gap-2.5"
					aria-label="Gridline home"
				>
					<span className="relative grid h-8 w-8 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--navy)]">
						<Grid2x2 className="h-4 w-4 text-cobalt-bright" />
						<span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
					</span>
					<span className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink">
						Gridline
					</span>
				</a>

				<div className="hidden items-center gap-7 md:flex">
					{LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="font-mono text-xs uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-cobalt-bright"
						>
							{link.label}
						</a>
					))}
				</div>

				<a
					href="#integrate"
					className="flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--navy)] px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink transition-all hover:border-cobalt-bright hover:text-cobalt-bright"
				>
					<Github className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">Get the file</span>
					<span className="sm:hidden">Get</span>
				</a>
			</nav>
		</header>
	);
}
