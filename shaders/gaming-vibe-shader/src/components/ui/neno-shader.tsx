"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * neno-shader.tsx
 *
 * The "Gaming vibe Shader" from the brief: a full-bleed plane rendering a
 * neon concentric-ring field that warps, breathes and slowly rotates, with an
 * electric-blue → magenta gradient and a grain pass.
 *
 * The brief's original `ShaderAnimation` is preserved verbatim below as the
 * zero-config default export. `NenoShader` is the same render core with the
 * shader's baked-in constants promoted to live uniforms (speed, ring count,
 * warp, hue blend) plus pointer parallax and a per-frame telemetry callback —
 * so a host UI can drive and read the shader without forking the GLSL.
 */

export type NenoFrame = {
	/** Shader clock in seconds (uniform `time` / accumulation rate). */
	time: number;
	/** Smoothed render rate, frames per second. */
	fps: number;
	/** DevicePixelRatio the renderer is sampling at. */
	pixelRatio: number;
	/** Active iteration / ring count in the GLSL loop. */
	rings: number;
	/** Normalised warp center the rings orbit, in clip space [-1, 1]. */
	warp: { x: number; y: number };
};

export type NenoShaderProps = {
	/** Time accumulation per frame. Higher = faster pulse. Default 0.05. */
	speed?: number;
	/** Ring iterations in the GLSL loop, clamped 1–12. Default 7 (brief value). */
	rings?: number;
	/** UV warp/breathe amplitude. 0 = perfectly round rings. Default 0.1. */
	warp?: number;
	/** Blend between electric-blue and magenta poles, 0–1. Default 0.5. */
	hueBlend?: number;
	/** Pointer parallax strength for the warp center, in UV units. Default 0.35. */
	parallax?: number;
	/** Per-frame telemetry, throttled internally — safe to wire to React state. */
	onFrame?: (frame: NenoFrame) => void;
	className?: string;
};

const vertexShader = /* glsl */ `
	void main() {
		gl_Position = vec4( position, 1.0 );
	}
`;

// Fragment shader — the brief's "More Creative Version", with the four magic
// numbers (speed is host-side, ring count, warp amplitude, colour blend) lifted
// to uniforms and a pointer-driven offset added to the warp center.
const fragmentShader = /* glsl */ `
	precision highp float;
	uniform vec2 resolution;
	uniform float time;
	uniform float ringCount;   // loop iterations (rings)
	uniform float warpAmt;     // UV distortion amplitude
	uniform float hueBlend;    // electric-blue <-> magenta bias
	uniform vec2 pointer;      // parallax offset for the warp center

	// 2D rotation function
	mat2 rotate2d(float angle){
		return mat2(cos(angle),-sin(angle),
					sin(angle),cos(angle));
	}

	// 2D pseudo-random function
	float random(vec2 st){
		return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
	}

	void main(void) {
		vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
		float t = time * 0.1;

		// Parallax: nudge the ring center toward the pointer.
		uv -= pointer;

		// --- Creative UV Distortion ---
		// Make the rings warp and breathe
		uv += vec2(sin(uv.y * 4.0 + t * 2.0), cos(uv.x * 4.0 + t * 2.0)) * warpAmt;
		uv = rotate2d(t * 0.25) * uv; // Slowly rotate the whole scene

		// The core calculation, enhanced
		float intensity = 0.0;
		float lineWidth = 0.02; // Make lines a bit thicker

		for(int i=0; i < 12; i++){ // hard cap; ringCount gates the active count
			if(float(i) >= ringCount) break;
			float i_float = float(i);
			// Use a smoother wave function (sin) for a less harsh pulse
			float wave = sin(t * 2.0 + i_float * 0.5) * 0.5 + 0.5; // normalized sine wave
			intensity += lineWidth / abs(wave - length(uv) + sin(uv.x + uv.y) * 0.1);
		}

		// --- Creative Coloring ---
		// Define a cool and a warm color
		vec3 color1 = vec3(0.0, 0.5, 1.0); // Electric Blue
		vec3 color2 = vec3(1.0, 0.2, 0.5); // Magenta/Pink

		// Mix colors based on UV position and time for a dynamic gradient,
		// biased by the host-controlled hueBlend.
		float mixT = clamp(sin(length(uv) * 2.0 - t) * 0.5 + 0.5 + (hueBlend - 0.5), 0.0, 1.0);
		vec3 baseColor = mix(color1, color2, mixT);

		// Apply the calculated intensity to the base color
		vec3 finalColor = baseColor * intensity;

		// Add a subtle grain/noise for texture
		finalColor += (random(uv + t) - 0.5) * 0.08;

		gl_FragColor = vec4(finalColor, 1.0);
	}
`;

export function NenoShader({
	speed = 0.05,
	rings = 7,
	warp = 0.1,
	hueBlend = 0.5,
	parallax = 0.35,
	onFrame,
	className = "neno-shader-canvas",
}: NenoShaderProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Live prop mirror so the rAF loop reads the latest controls without
	// re-running the (expensive) WebGL setup effect.
	const props = useRef({ speed, rings, warp, hueBlend, parallax });
	props.current = { speed, rings, warp, hueBlend, parallax };

	const onFrameRef = useRef(onFrame);
	onFrameRef.current = onFrame;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Pointer target (UV space) + an eased value we lerp toward each frame.
		const pointerTarget = new THREE.Vector2(0, 0);
		const pointerEased = new THREE.Vector2(0, 0);

		const camera = new THREE.Camera();
		camera.position.z = 1;

		const scene = new THREE.Scene();
		const geometry = new THREE.PlaneGeometry(2, 2);

		const uniforms = {
			time: { value: 1.0 },
			resolution: { value: new THREE.Vector2() },
			ringCount: { value: props.current.rings },
			warpAmt: { value: props.current.warp },
			hueBlend: { value: props.current.hueBlend },
			pointer: { value: new THREE.Vector2(0, 0) },
		};

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		// Cap DPR at 2 — high-DPR screens otherwise tank the fill-rate-heavy
		// per-pixel loop with no visible gain.
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		renderer.setPixelRatio(dpr);
		container.appendChild(renderer.domElement);

		const onWindowResize = () => {
			const width = container.clientWidth || window.innerWidth;
			const height = container.clientHeight || window.innerHeight;
			renderer.setSize(width, height);
			uniforms.resolution.value.x = renderer.domElement.width;
			uniforms.resolution.value.y = renderer.domElement.height;
		};
		onWindowResize();
		window.addEventListener("resize", onWindowResize, false);

		// Pointer parallax: map cursor to clip space and stash as a target.
		// Listen on `window` rather than the container — as a fixed, z-index:-1
		// background the canvas itself never receives pointer events, since the
		// host UI sits on top of it.
		const onPointerMove = (e: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const w = rect.width || window.innerWidth;
			const h = rect.height || window.innerHeight;
			const nx = ((e.clientX - rect.left) / w) * 2 - 1;
			const ny = -(((e.clientY - rect.top) / h) * 2 - 1);
			pointerTarget.set(nx, ny);
		};
		const onPointerLeave = () => pointerTarget.set(0, 0);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerout", onPointerLeave);

		// Respect users who prefer reduced motion — freeze the clock advance but
		// still render one lit frame so the rings are visible, just static.
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let animationId = 0;
		let lastNow = performance.now();
		let fps = 0;
		let lastEmit = 0;

		const animate = () => {
			animationId = requestAnimationFrame(animate);
			const now = performance.now();
			const dt = now - lastNow;
			lastNow = now;
			// Exponential moving average keeps the FPS readout from flickering.
			if (dt > 0) fps = fps === 0 ? 1000 / dt : fps * 0.9 + (1000 / dt) * 0.1;

			const p = props.current;
			uniforms.time.value += reduceMotion ? 0 : p.speed;
			uniforms.ringCount.value = p.rings;
			uniforms.warpAmt.value = p.warp;
			uniforms.hueBlend.value = p.hueBlend;

			// Ease the eased pointer toward target, then scale by parallax.
			pointerEased.lerp(pointerTarget, 0.06);
			uniforms.pointer.value.set(
				pointerEased.x * p.parallax,
				pointerEased.y * p.parallax,
			);

			renderer.render(scene, camera);

			// Throttle telemetry to ~15Hz so host React state stays cheap.
			if (onFrameRef.current && now - lastEmit > 66) {
				lastEmit = now;
				onFrameRef.current({
					time: uniforms.time.value,
					fps,
					pixelRatio: dpr,
					rings: Math.round(p.rings),
					warp: { x: uniforms.pointer.value.x, y: uniforms.pointer.value.y },
				});
			}
		};
		animate();

		return () => {
			window.removeEventListener("resize", onWindowResize);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerout", onPointerLeave);
			cancelAnimationFrame(animationId);
			if (renderer.domElement.parentNode === container) {
				container.removeChild(renderer.domElement);
			}
			renderer.dispose();
			geometry.dispose();
			material.dispose();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				width: "100%",
				height: "100%",
				background: "#000",
				overflow: "hidden",
			}}
		/>
	);
}

/**
 * The brief's component, verbatim — zero props, fixed constants. Kept as the
 * default export so a host can drop in `<ShaderAnimation />` exactly as the
 * brief shows, while `NenoShader` (named export) is the controllable variant.
 */
export function ShaderAnimation() {
	return <NenoShader speed={0.05} rings={7} warp={0.1} hueBlend={0.5} parallax={0} />;
}

export default NenoShader;
