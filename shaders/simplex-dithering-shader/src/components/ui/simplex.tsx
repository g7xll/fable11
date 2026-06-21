import { useState } from "react";
import {
	DitheringShader,
	type DitheringTelemetry,
} from "@/components/ui/dithering-shader";
import { cn } from "@/lib/utils";

/**
 * The component scaffold shipped with the integration prompt. Kept verbatim so
 * the registry entry stays faithful; the page itself renders {@link SimplexDemo}.
 */
export const Component = () => {
	const [count, setCount] = useState(0);

	return (
		<div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg")}>
			<h1 className="text-2xl font-bold mb-2">Component Example</h1>
			<h2 className="text-xl font-semibold">{count}</h2>
			<div className="flex gap-2">
				<button onClick={() => setCount((prev) => prev - 1)}>-</button>
				<button onClick={() => setCount((prev) => prev + 1)}>+</button>
			</div>
		</div>
	);
};

interface SimplexDemoProps {
	/** Forwarded so the host page can drive `fill="window"` full-bleed. */
	fill?: "fixed" | "window";
	paused?: boolean;
	onTelemetry?: (t: DitheringTelemetry) => void;
}

/**
 * The integration's `demo.tsx`, realized verbatim: the ripple dithering field
 * (2×2 Bayer, amber-on-oxblood) full-bleed behind a centered "Simplex" lockup.
 *
 * The props/visuals match the brief exactly:
 *   shape="ripple" type="2x2" colorBack="#330000" colorFront="#ffff00"
 *   pxSize={2} speed={1.2}
 */
export default function SimplexDemo({
	fill = "window",
	paused = false,
	onTelemetry,
}: SimplexDemoProps) {
	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
			<DitheringShader
				shape="ripple"
				type="2x2"
				colorBack="#330000"
				colorFront="#ffff00"
				pxSize={2}
				speed={1.2}
				fill={fill}
				paused={paused}
				onTelemetry={onTelemetry}
				className="absolute inset-0"
			/>
			<span className="pointer-events-none absolute z-10 whitespace-pre-wrap text-center font-display text-7xl font-semibold leading-none tracking-tighter text-white">
				Simplex
			</span>
		</div>
	);
}
