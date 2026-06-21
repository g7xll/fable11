import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { InstrumentRail } from "@/components/instrument-rail";
import { IntegrationDocket } from "@/components/integration-docket";
import { SpecimenReticle } from "@/components/specimen-reticle";
import {
	ControlsPanel,
	InteractiveShader,
	type ShaderFrame,
	type ShaderParams,
} from "@/components/ui/liquid-crystal";
import { readInterference } from "@/lib/birefringence";

export default function DemoOne() {
	// State for shader parameters, controlled by the UI sliders.
	// Tuned toward cyan so the bands open on a second/third-order interference
	// colour — the most recognizable "liquid crystal" look.
	const [params, setParams] = useState<ShaderParams>({
		hue: 188,
		speed: 0.5,
		noise: 0.28,
		warp: 0.14,
		zoom: 1.6,
		brightness: 1.0,
	});

	const handleParamChange = useCallback(
		(param: keyof ShaderParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseFloat(e.target.value);
			setParams((p) => ({ ...p, [param]: value }));
		},
		[],
	);

	// Live render-loop telemetry, throttled to ~10 Hz so the React readouts
	// update smoothly without re-rendering on every animation frame.
	const [frame, setFrame] = useState<ShaderFrame>({
		time: 0,
		fps: 0,
		mouse: { x: 0.5, y: 0.5 },
	});
	const lastEmit = useRef(0);
	const handleFrame = useCallback((f: ShaderFrame) => {
		const now = performance.now();
		if (now - lastEmit.current < 100) return;
		lastEmit.current = now;
		setFrame(f);
	}, []);

	const reading = useMemo(() => readInterference(params.hue), [params.hue]);

	return (
		<div className="grain vignette relative h-screen w-full overflow-hidden bg-bench-black font-sans antialiased">
			{/* The live specimen — verbatim shader component on a full-bleed quad. */}
			<InteractiveShader {...params} onFrame={handleFrame} />

			{/* Signature: crossed-polarizer reticle tracking the mouse-warp centre. */}
			<SpecimenReticle mouse={frame.mouse} reading={reading} />

			{/* The prompt's ControlsPanel, kept exactly where it specifies (top-left). */}
			<div className="animate-rise">
				<ControlsPanel params={params} onParamChange={handleParamChange} />
			</div>

			{/* Instrument frame around the specimen. */}
			<InstrumentRail
				fps={frame.fps}
				time={frame.time}
				mouse={frame.mouse}
				params={params}
				reading={reading}
			/>
			<IntegrationDocket />
		</div>
	);
}
