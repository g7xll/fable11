"use client";

import { DotOrbit, MeshGradient } from "@paper-design/shaders-react";

/**
 * PaperShadersStage — renders the @paper-design/shaders-react channels.
 *
 * The prompt's demo.tsx was written against an older shaders-react API
 * (backgroundColor / wireframe / dotColor / orbitColor / intensity props that
 * no longer exist). This adapts the same three channels — mesh, dots, combined
 * — to the current v0.0.76 API so the shaders actually render, while keeping
 * the original intent: speed and "intensity" drive the look live.
 */
export type PaperChannel = "mesh" | "dots" | "combined";

const MESH_COLORS = ["#0b0c0e", "#163d39", "#54e6c8", "#f2f0ea"];
const DOT_COLORS = ["#54e6c8", "#2c7a6c", "#163d39", "#0b0c0e"];

export function PaperShadersStage({
	channel,
	speed,
	intensity,
}: {
	channel: PaperChannel;
	speed: number;
	intensity: number;
}) {
	// "intensity" maps onto the geometric character of each shader so the fader
	// produces a visible, continuous change in both channels.
	const distortion = 0.45 + intensity * 0.45; // mesh warp
	const swirl = 0.05 + intensity * 0.5; // mesh swirl
	const spreading = 0.55 + intensity * 0.7; // dot field density
	const dotSize = 0.6 + intensity * 0.55; // dot radius

	if (channel === "mesh") {
		return (
			<MeshGradient
				className="absolute inset-0 h-full w-full"
				colors={MESH_COLORS}
				speed={speed}
				distortion={distortion}
				swirl={swirl}
				grainMixer={0.18}
				grainOverlay={0.12}
			/>
		);
	}

	if (channel === "dots") {
		return (
			<DotOrbit
				className="absolute inset-0 h-full w-full"
				colors={DOT_COLORS}
				colorBack="#070809"
				speed={speed * 1.4}
				size={dotSize}
				sizeRange={0.4}
				spreading={spreading}
				stepsPerColor={4}
				scale={0.7}
			/>
		);
	}

	// combined: mesh base + dot field layered over it
	return (
		<>
			<MeshGradient
				className="absolute inset-0 h-full w-full"
				colors={MESH_COLORS}
				speed={speed * 0.5}
				distortion={distortion}
				swirl={swirl * 1.4}
				grainMixer={0.1}
				grainOverlay={0.1}
			/>
			<div className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen">
				<DotOrbit
					className="absolute inset-0 h-full w-full"
					colors={DOT_COLORS}
					colorBack="#00000000"
					speed={speed * 1.6}
					size={dotSize * 0.85}
					sizeRange={0.5}
					spreading={spreading * 1.1}
					stepsPerColor={3}
					scale={0.85}
				/>
			</div>
		</>
	);
}
