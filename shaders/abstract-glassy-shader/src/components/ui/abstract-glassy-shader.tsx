// src/components/ui/abstract-glassy-shader.tsx
//
// Abstract Glassy Shader — a drop-in WebGL2 metaball field.
//
// This is the source component from the prompt, integrated into a typed,
// shadcn-style `components/ui` module. The GLSL is preserved verbatim for the
// default look (two SDF circles fused with a smooth union, an exponential glow,
// and a cosine spectrum); the hard-coded constants are promoted to optional
// uniforms so the field can be driven live, and a few quality-of-life additions
// are layered on without changing the default render:
//
//   • optional `settings` to morph the field (speed, radii, merge, glow, …)
//   • an `onFrame` callback emitting truthful per-frame telemetry
//   • container-aware sizing via ResizeObserver (works in any layout)
//   • a graceful CSS fallback if WebGL2 is unavailable (never goes black)
//
// With no props, `<ShaderComponent />` renders exactly the original shader.
import React, { useEffect, useRef, useState } from "react";

/* ---------- Public types ---------- */

export type PaletteId = "spectrum" | "glass" | "ember";

export interface ShaderSettings {
	/** Global time multiplier. 1 = the original speed. */
	speed: number;
	/** Radius of blob A (uv units). Original: 0.2 */
	radius1: number;
	/** Radius of blob B (uv units). Original: 0.16 */
	radius2: number;
	/** Smooth-union blend factor `k`. Original: 0.2 */
	merge: number;
	/** Glow falloff: higher = tighter rim. Original: 10 */
	glow: number;
	/** Orbit horizontal amplitude; vertical is half of this. Original: 0.4 */
	spread: number;
	/** Intensity of the hard white core (0–1). Original: 1 */
	core: number;
	/** Colour ramp. `spectrum` is the verbatim original. */
	palette: PaletteId;
	/** Freeze the animation clock. */
	paused: boolean;
}

export const DEFAULT_SETTINGS: ShaderSettings = {
	speed: 1,
	radius1: 0.2,
	radius2: 0.16,
	merge: 0.2,
	glow: 10,
	spread: 0.4,
	core: 1,
	palette: "spectrum",
	paused: false,
};

/** Truthful per-frame readouts, derived from the exact shader expressions. */
export interface ShaderStats {
	/** Shader clock, in seconds (already scaled by `speed`). */
	time: number;
	/** Smoothed frames per second. */
	fps: number;
	/** Drawing-buffer resolution in device pixels (matches the `resolution` uniform). */
	width: number;
	height: number;
	/** Live centre of blob A in uv units. */
	blobA: [number, number];
	/** Live centre of blob B in uv units. */
	blobB: [number, number];
}

export interface ShaderComponentProps {
	className?: string;
	style?: React.CSSProperties;
	/** Partial overrides; anything omitted falls back to the original constants. */
	settings?: Partial<ShaderSettings>;
	/** Emitted once per animation frame. Keep handlers cheap (e.g. write a ref). */
	onFrame?: (stats: ShaderStats) => void;
}

/* ---------- GLSL Fragment Shader ----------
   Structurally identical to the source. The literal constants are replaced by
   uniforms whose defaults reproduce the original frame exactly. */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;
precision highp int;

uniform float time;
uniform vec2 resolution;
uniform float uRadius1;
uniform float uRadius2;
uniform float uMerge;
uniform float uGlow;
uniform float uSpread;
uniform float uCore;
uniform int uPalette;
out vec4 fragColor;

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float scene(vec2 uv) {
  vec2 pos1 = vec2(cos(time) * uSpread, sin(time * 2.0) * uSpread * 0.5);
  float c1 = sdCircle(uv - pos1, uRadius1);

  vec2 pos2 = vec2(cos(time + 3.14) * uSpread, sin(time * 2.0 + 3.14) * uSpread * 0.5);
  float c2 = sdCircle(uv - pos2, uRadius2);

  return opSmoothUnion(c1, c2, uMerge);
}

vec3 palette(vec2 uv) {
  if (uPalette == 1) {
    // Glass — cool, refractive cyan-to-white
    vec3 base = 0.5 + 0.5 * cos(time * 0.6 + uv.xyx * 1.15 + vec3(4.2, 2.6, 1.0));
    return mix(vec3(0.16, 0.55, 0.85), vec3(0.85, 0.97, 1.0), base);
  } else if (uPalette == 2) {
    // Ember — warm amber-to-magenta
    vec3 base = 0.5 + 0.5 * cos(time * 0.7 + uv.xyx + vec3(0.0, 0.55, 1.15));
    return mix(vec3(0.95, 0.32, 0.12), vec3(1.0, 0.86, 0.42), base);
  }
  // Spectrum (default) — verbatim from the source component
  return 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  float d = scene(uv);
  float glow = exp(-uGlow * abs(d));
  vec3 color = palette(uv);
  vec3 finalColor = color * glow + uCore * smoothstep(0.01, 0.0, d);
  fragColor = vec4(finalColor, 1.0);
}
`;

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec4 position;
void main() {
  gl_Position = position;
}`;

// Phase offset for blob B. The shader uses the literal 3.14, so we mirror it on
// the CPU side too — this keeps the reported blob centres exact, not approximate.
const PHASE = 3.14;

const PALETTE_INDEX: Record<PaletteId, number> = {
	spectrum: 0,
	glass: 1,
	ember: 2,
};

type UniformName =
	| "time"
	| "resolution"
	| "uRadius1"
	| "uRadius2"
	| "uMerge"
	| "uGlow"
	| "uSpread"
	| "uCore"
	| "uPalette";

/* ---------- Typed WebGL2 renderer ---------- */
class ShaderRenderer {
	readonly ok: boolean;
	private gl: WebGL2RenderingContext | null;
	private program: WebGLProgram | null = null;
	private buffer: WebGLBuffer | null = null;
	private uniforms: Partial<Record<UniformName, WebGLUniformLocation | null>> =
		{};

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl2", {
			antialias: true,
			premultipliedAlpha: false,
		});
		this.gl = gl;
		this.ok = gl ? this.init() : false;
	}

	private compile(type: number, src: string): WebGLShader | null {
		const gl = this.gl!;
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	private init(): boolean {
		const gl = this.gl!;
		const vs = this.compile(gl.VERTEX_SHADER, VERTEX_SHADER);
		const fs = this.compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		if (!vs || !fs) return false;

		const program = gl.createProgram();
		if (!program) return false;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			return false;
		}
		this.program = program;

		// Full-screen quad.
		const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
		const buffer = gl.createBuffer();
		this.buffer = buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

		const posLoc = gl.getAttribLocation(program, "position");
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		const names: UniformName[] = [
			"time",
			"resolution",
			"uRadius1",
			"uRadius2",
			"uMerge",
			"uGlow",
			"uSpread",
			"uCore",
			"uPalette",
		];
		for (const name of names)
			this.uniforms[name] = gl.getUniformLocation(program, name);
		return true;
	}

	resize(cssWidth: number, cssHeight: number): void {
		const gl = this.gl;
		if (!gl) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, Math.round(cssWidth * dpr));
		const h = Math.max(1, Math.round(cssHeight * dpr));
		if (gl.canvas.width !== w || gl.canvas.height !== h) {
			gl.canvas.width = w;
			gl.canvas.height = h;
		}
		gl.viewport(0, 0, w, h);
	}

	render(time: number, s: ShaderSettings): void {
		const gl = this.gl;
		if (!gl || !this.program) return;
		const u = this.uniforms;
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(this.program);
		gl.uniform1f(u.time ?? null, time);
		gl.uniform2f(u.resolution ?? null, gl.canvas.width, gl.canvas.height);
		gl.uniform1f(u.uRadius1 ?? null, s.radius1);
		gl.uniform1f(u.uRadius2 ?? null, s.radius2);
		gl.uniform1f(u.uMerge ?? null, Math.max(0.0001, s.merge));
		gl.uniform1f(u.uGlow ?? null, s.glow);
		gl.uniform1f(u.uSpread ?? null, s.spread);
		gl.uniform1f(u.uCore ?? null, s.core);
		gl.uniform1i(u.uPalette ?? null, PALETTE_INDEX[s.palette]);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	dispose(): void {
		const gl = this.gl;
		if (!gl) return;
		// Free GL resources but keep the context alive: a canvas hands back the same
		// context on the next getContext(), and React StrictMode remounts the effect
		// on the same canvas — losing the context here would poison that second mount.
		if (this.program) gl.deleteProgram(this.program);
		if (this.buffer) gl.deleteBuffer(this.buffer);
		this.program = null;
		this.buffer = null;
	}
}

/* ---------- Animation hook ---------- */
function useShaderAnimation(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	settingsRef: React.MutableRefObject<ShaderSettings>,
	onFrameRef: React.MutableRefObject<ShaderComponentProps["onFrame"]>,
	setFailed: (v: boolean) => void,
) {
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const renderer = new ShaderRenderer(canvas);
		if (!renderer.ok) {
			setFailed(true);
			return;
		}

		let rafId = 0;
		let clock = 0; // accumulated, speed-scaled shader time (seconds)
		let last = performance.now();
		let fps = 60;

		const sizeToBox = () => {
			const rect = canvas.getBoundingClientRect();
			renderer.resize(
				rect.width || window.innerWidth,
				rect.height || window.innerHeight,
			);
		};

		const ro = new ResizeObserver(sizeToBox);
		ro.observe(canvas);
		sizeToBox();

		const animate = (now: number) => {
			const dt = Math.min((now - last) / 1000, 0.05); // clamp big tab-switch gaps
			last = now;
			const s = settingsRef.current;
			if (!s.paused) clock += dt * s.speed;

			const instant = dt > 0 ? 1 / dt : 60;
			fps += (instant - fps) * 0.1; // exponential smoothing

			renderer.render(clock, s);

			const onFrame = onFrameRef.current;
			if (onFrame) {
				const gl = canvas as HTMLCanvasElement;
				onFrame({
					time: clock,
					fps,
					width: gl.width,
					height: gl.height,
					blobA: [
						Math.cos(clock) * s.spread,
						Math.sin(clock * 2) * s.spread * 0.5,
					],
					blobB: [
						Math.cos(clock + PHASE) * s.spread,
						Math.sin(clock * 2 + PHASE) * s.spread * 0.5,
					],
				});
			}
			rafId = requestAnimationFrame(animate);
		};
		rafId = requestAnimationFrame(animate);

		const onLost = (e: Event) => {
			e.preventDefault();
			setFailed(true);
		};
		canvas.addEventListener("webglcontextlost", onLost);

		return () => {
			cancelAnimationFrame(rafId);
			ro.disconnect();
			canvas.removeEventListener("webglcontextlost", onLost);
			renderer.dispose();
		};
	}, [canvasRef, settingsRef, onFrameRef, setFailed]);
}

/* ---------- CSS fallback (WebGL2 unavailable) ---------- */
function GlassFallback({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	// Two drifting metaballs approximated with blurred radial gradients so the
	// surface never collapses to flat black on GL-less environments.
	return (
		<div
			className={className}
			style={style}
			data-shader-fallback="true"
			aria-hidden="true"
		>
			<div className="glassy-fallback">
				<span className="glassy-fallback__blob glassy-fallback__blob--a" />
				<span className="glassy-fallback__blob glassy-fallback__blob--b" />
			</div>
		</div>
	);
}

/* ---------- Component ---------- */
export function ShaderComponent({
	className,
	style,
	settings,
	onFrame,
}: ShaderComponentProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [failed, setFailed] = useState(false);

	// Latest settings/handler exposed to the rAF loop without re-subscribing it.
	const merged: ShaderSettings = { ...DEFAULT_SETTINGS, ...settings };
	const settingsRef = useRef<ShaderSettings>(merged);
	settingsRef.current = merged;
	const onFrameRef = useRef<ShaderComponentProps["onFrame"]>(onFrame);
	onFrameRef.current = onFrame;

	useShaderAnimation(canvasRef, settingsRef, onFrameRef, setFailed);

	if (failed) return <GlassFallback className={className} style={style} />;

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={{ display: "block", width: "100%", height: "100%", ...style }}
		/>
	);
}

export default ShaderComponent;
