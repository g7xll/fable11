import { useEffect, useRef, useState } from "react";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { useDebounced } from "@/hooks/useDebounced";
import type { LiveParams, Size } from "@/lib/shader-meta";

interface ResponsiveDitherProps {
	params: LiveParams;
	className?: string;
	/** How early (margin) the shader mounts relative to the viewport. */
	rootMargin?: string;
	/** Mount once and stay (specimens) vs. track visibility both ways (hero). */
	once?: boolean;
	/** Debounce applied to params before they reach the verbatim component. */
	debounce?: number;
	onResize?: (size: Size) => void;
}

/**
 * Wraps the verbatim <DitheringShader /> (which takes fixed pixel width/height)
 * in a self-measuring, viewport-gated container so the same component can be
 * dropped in as a full-bleed hero or a small specimen tile and stay responsive.
 * Each live canvas owns a WebGL2 context, so mounting is gated on visibility to
 * keep the number of simultaneous contexts bounded.
 */
export function ResponsiveDither({
	params,
	className,
	rootMargin = "150px",
	once = false,
	debounce = 90,
	onResize,
}: ResponsiveDitherProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<Size>({ width: 0, height: 0 });
	const [inView, setInView] = useState(false);
	const debounced = useDebounced(params, debounce);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const next: Size = {
				width: Math.round(entry.contentRect.width),
				height: Math.round(entry.contentRect.height),
			};
			setSize(next);
			onResize?.(next);
		});
		resizeObserver.observe(el);

		const inViewObserver = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) return;
				if (entry.isIntersecting) {
					setInView(true);
					if (once) inViewObserver.disconnect();
				} else if (!once) {
					setInView(false);
				}
			},
			{ rootMargin },
		);
		inViewObserver.observe(el);

		return () => {
			resizeObserver.disconnect();
			inViewObserver.disconnect();
		};
	}, [rootMargin, once, onResize]);

	const ready = inView && size.width > 0 && size.height > 0;

	return (
		<div ref={ref} className={className}>
			{ready && (
				<DitheringShader
					width={size.width}
					height={size.height}
					shape={debounced.shape}
					type={debounced.type}
					pxSize={debounced.pxSize}
					speed={debounced.speed}
					colorBack={debounced.colorBack}
					colorFront={debounced.colorFront}
					className="h-full w-full"
				/>
			)}
		</div>
	);
}
