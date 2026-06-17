import { Github, Menu, Waves, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "#deck", label: "Control deck" },
	{ href: "#anatomy", label: "Anatomy" },
	{ href: "#install", label: "Install" },
	{ href: "#field", label: "In the field" },
];

export function Nav() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-colors duration-300",
				scrolled
					? "border-b border-[var(--line)] bg-[rgba(5,5,16,0.72)] backdrop-blur-md"
					: "border-b border-transparent",
			)}
		>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
				<a href="#top" className="group flex items-center gap-2.5">
					<span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-solid)] text-violet">
						<Waves className="h-4 w-4" strokeWidth={2.2} />
					</span>
					<span className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
						PLASMA<span className="text-violet">SIGNAL</span>
					</span>
				</a>

				<nav className="hidden items-center gap-7 md:flex">
					{LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="font-mono text-xs uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-ink"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<a
						href="#install"
						className="hidden items-center gap-2 rounded-md border border-[var(--line-strong)] bg-violet-deep/15 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-violet-deep/30 sm:flex"
					>
						<Github className="h-3.5 w-3.5" />
						Copy file
					</a>
					<button
						type="button"
						aria-label={open ? "Close menu" : "Open menu"}
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
						className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-solid)] text-ink md:hidden"
					>
						{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
					</button>
				</div>
			</div>

			{open && (
				<nav className="border-t border-[var(--line)] bg-[rgba(5,5,16,0.95)] px-5 py-4 md:hidden">
					<ul className="flex flex-col gap-1">
						{LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									onClick={() => setOpen(false)}
									className="block rounded-md px-3 py-2.5 font-mono text-sm uppercase tracking-[0.12em] text-ink-dim hover:bg-white/5 hover:text-ink"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</nav>
			)}
		</header>
	);
}
