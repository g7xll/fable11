import { DitheringShader } from "@/components/ui/dithering-shader";

/**
 * The canonical demo shipped with the component (verbatim from the prompt): the
 * swirl shape dithered through a 4x4 Bayer matrix, cyan beam on a deep-magenta
 * void, with a centered wordmark.
 */
export default function DemoOne() {
	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
			<DitheringShader
				shape="swirl"
				type="4x4"
				colorBack="#220011"
				colorFront="#00ffff"
				pxSize={4}
				speed={0.9}
			/>
			<span className="pointer-events-none absolute z-10 whitespace-pre-wrap text-center text-7xl font-semibold leading-none tracking-tighter text-white">
				Swirl
			</span>
		</div>
	);
}
