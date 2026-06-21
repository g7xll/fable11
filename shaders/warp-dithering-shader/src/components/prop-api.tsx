import { PROP_SPECS } from "@/lib/shader-meta";
import type { LiveParams, Size } from "@/lib/shader-meta";

function liveValue(name: string, params: LiveParams, size: Size): string {
	switch (name) {
		case "shape":
			return `"${params.shape}"`;
		case "type":
			return `"${params.type}"`;
		case "colorBack":
			return params.colorBack;
		case "colorFront":
			return params.colorFront;
		case "pxSize":
			return params.pxSize.toFixed(0);
		case "speed":
			return params.speed.toFixed(1);
		case "width":
			return size.width ? String(size.width) : "—";
		case "height":
			return size.height ? String(size.height) : "—";
		default:
			return "—";
	}
}

interface PropApiProps {
	params: LiveParams;
	size: Size;
}

/** A live props table — the "now" column reflects the hero's current uniforms. */
export function PropApi({ params, size }: PropApiProps) {
	return (
		<div className="overflow-hidden border border-border/70">
			<div className="grid grid-cols-[1.1fr_1.3fr_0.7fr_0.7fr] gap-2 border-b border-border/70 bg-panel/70 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest2 text-ash sm:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_2fr]">
				<span>Prop</span>
				<span className="hidden sm:block">Type</span>
				<span>Default</span>
				<span>Now</span>
				<span className="hidden sm:block">Maps to</span>
			</div>
			<div className="divide-y divide-border/60">
				{PROP_SPECS.map((spec) => (
					<div
						key={spec.name}
						className="grid grid-cols-[1.1fr_1.3fr_0.7fr_0.7fr] gap-2 px-4 py-2.5 text-[12px] sm:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_2fr]"
					>
						<span className="font-mono text-amber">{spec.name}</span>
						<span className="hidden font-mono text-[11px] text-ash sm:block">
							{spec.type}
						</span>
						<span className="font-mono text-[11px] text-ash">
							{spec.fallback}
						</span>
						<span className="font-mono text-[11px] tabular-nums text-bone">
							{liveValue(spec.name, params, size)}
						</span>
						<span className="col-span-4 mt-1 text-[11px] leading-relaxed text-ash sm:col-span-1 sm:mt-0">
							<span className="font-mono text-amber/70">{spec.uniform}</span>
							<span className="mx-1.5 text-border">·</span>
							{spec.note}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
