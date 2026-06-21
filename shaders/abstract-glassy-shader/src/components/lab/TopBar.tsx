import { Github } from "lucide-react";

function BlobMark() {
	return (
		<svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
			<defs>
				<radialGradient id="bm" cx="0.4" cy="0.35" r="0.85">
					<stop offset="0" stopColor="#aef7ff" />
					<stop offset="0.45" stopColor="#37c6ff" />
					<stop offset="1" stopColor="#c04bff" />
				</radialGradient>
			</defs>
			<rect
				width="32"
				height="32"
				rx="9"
				fill="#0a0d18"
				stroke="rgba(176,196,255,0.18)"
			/>
			<circle cx="13" cy="16" r="6" fill="url(#bm)" />
			<circle cx="20.4" cy="16" r="4.4" fill="url(#bm)" />
			<circle cx="16.7" cy="16" r="5.4" fill="url(#bm)" opacity="0.9" />
		</svg>
	);
}

export function TopBar() {
	return (
		<header className="pointer-events-none fixed inset-x-0 top-0 z-40">
			<div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
				<div className="pointer-events-auto flex items-center gap-2.5">
					<BlobMark />
					<div className="leading-none">
						<div className="text-[15px] font-semibold tracking-tight text-foreground">
							GLASSWORKS
						</div>
						<div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
							shader lab
						</div>
					</div>
				</div>

				<div className="pointer-events-auto flex items-center gap-2">
					<span className="hidden items-center gap-1.5 rounded-full border border-border bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur sm:inline-flex">
						<span className="h-1.5 w-1.5 rounded-full bg-accent" />
						WebGL2
					</span>
					<span className="hidden rounded-full border border-border bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur md:inline-flex">
						@/components/ui
					</span>
					<a
						href="https://github.com/pulkitxm/claude-directory"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-full border border-border bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/80 backdrop-blur transition-colors hover:bg-white/10"
					>
						<Github className="h-3.5 w-3.5" />
						Source
					</a>
				</div>
			</div>
		</header>
	);
}
