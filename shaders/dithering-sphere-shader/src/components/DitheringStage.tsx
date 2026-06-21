import { useEffect, useRef, useState } from "react";

import { DitheringShader } from "@/components/ui/dithering-shader";
import { cn } from "@/lib/utils";
import type { Params } from "@/lib/dithering";

type DitheringStageProps = {
	params: Params;
	className?: string;
	/** Cap the backing resolution so giant heroes don't allocate huge canvases. */
	maxSize?: number;
};

/**
 * The brief's `DitheringShader` takes fixed pixel `width`/`height`. This wrapper
 * makes it fill any container responsively: it measures itself with a
 * ResizeObserver and feeds the measured size straight into the component, so the
 * same verbatim shader can back a full-bleed hero, a preview tile, or a thumbnail.
 */
export function DitheringStage({
	params,
	className,
	maxSize = 1600,
}: DitheringStageProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ w: 0, h: 0 });

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;

		const measure = () => {
			const rect = host.getBoundingClientRect();
			const w = Math.min(Math.round(rect.width), maxSize);
			const h = Math.min(Math.round(rect.height), maxSize);
			setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(host);
		return () => ro.disconnect();
	}, [maxSize]);

	const ready = size.w > 0 && size.h > 0;

	return (
		<div ref={hostRef} className={cn("relative overflow-hidden", className)}>
			{ready && (
				<DitheringShader
					width={size.w}
					height={size.h}
					shape={params.shape}
					type={params.type}
					colorBack={params.colorBack}
					colorFront={params.colorFront}
					pxSize={params.pxSize}
					speed={params.speed}
					className="absolute inset-0 h-full w-full"
				/>
			)}
		</div>
	);
}
