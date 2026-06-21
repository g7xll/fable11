import { ArrowDown, Boxes } from "lucide-react";
import { CopyButton } from "@/components/lab/controls";
import { componentSource, usageSource } from "@/components/lab/sources";

const CHIPS = [
	"WebGL2 · 1 file",
	"Zero runtime deps",
	"Live uniforms",
	"CSS fallback",
];

export function HeroPanel() {
	return (
		<div className="glass max-w-[600px] rounded-2xl p-6 sm:p-8">
			<div className="animate-rise" style={{ animationDelay: "0.02s" }}>
				<span className="inline-flex items-center gap-2 rounded-full border border-border bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
					<span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
					Live · shadcn components/ui
				</span>
			</div>

			<p
				className="animate-rise mt-5 font-mono text-[11px] tracking-[0.06em] text-muted-foreground"
				style={{ animationDelay: "0.08s" }}
			>
				shadcn / ui / abstract-glassy-shader
			</p>

			<h1
				className="animate-rise mt-2 text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[3.1rem]"
				style={{ animationDelay: "0.12s" }}
			>
				The abstract <span className="text-spectrum">glassy</span> shader.
			</h1>

			<p
				className="animate-rise mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground"
				style={{ animationDelay: "0.18s" }}
			>
				Two signed-distance blobs, fused with a smooth union and lit by an
				exponential glow over a cosine spectrum. A single WebGL2 file that drops
				straight into{" "}
				<code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[12.5px] text-foreground/90">
					@/components/ui
				</code>{" "}
				— no Three.js, no providers, no assets.
			</p>

			<div
				className="animate-rise mt-5 flex items-center gap-2 overflow-hidden rounded-lg border border-border bg-black/40 px-3 py-2.5"
				style={{ animationDelay: "0.24s" }}
			>
				<span className="truncate font-mono text-[11.5px] text-foreground/80">
					import {"{ ShaderComponent }"} from
					"@/components/ui/abstract-glassy-shader"
				</span>
				<span className="ml-auto shrink-0">
					<CopyButton value={usageSource} label="" />
				</span>
			</div>

			<div
				className="animate-rise mt-5 flex flex-wrap items-center gap-3"
				style={{ animationDelay: "0.3s" }}
			>
				<CopyButton
					value={componentSource}
					label="Copy component"
					variant="solid"
				/>
				<a
					href="#integration"
					className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-4 py-2.5 text-[13px] font-medium text-foreground/85 transition-colors hover:bg-white/10"
				>
					<Boxes className="h-4 w-4" />
					Integration guide
				</a>
			</div>

			<div
				className="animate-rise mt-6 flex flex-wrap gap-x-5 gap-y-2"
				style={{ animationDelay: "0.36s" }}
			>
				{CHIPS.map((c) => (
					<span
						key={c}
						className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground"
					>
						<span className="mr-1.5 text-accent">/</span>
						{c}
					</span>
				))}
			</div>

			<a
				href="#integration"
				className="animate-rise mt-7 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
				style={{ animationDelay: "0.42s" }}
			>
				Scroll to docs
				<ArrowDown className="h-3.5 w-3.5 animate-bounce" />
			</a>
		</div>
	);
}
