/* ===========================================================================
   aperture-canvas.tsx — the showcase's interactive driver for the radial
   bloom. It is the *same* field as `@/components/ui/raidal-2`, with three of
   the shader's baked-in constants promoted to live uniforms so the control
   deck can tune them in real time:

       literal 9.0   ->  uBlades   (how many blades accumulate)
       literal 0.03  ->  uGain     (per-blade accumulation gain / exposure)
       hue phase     ->  uHue      (added inside the colour sine)

   It also adds an optional, smoothed pointer parallax (the bloom centre eases
   toward the cursor) and emits per-frame telemetry (fps / time / frame / dpr /
   resolution) so the instrument chrome can read the GPU's real cadence.

   The drop-in component itself is left untouched; this file is additive.
   =========================================================================== */
import { useEffect, useRef } from "react";

export interface ApertureFrame {
	fps: number;
	time: number;
	frame: number;
	dpr: number;
	width: number;
	height: number;
}

export interface ApertureCanvasProps {
	/** Number of accumulating blades. The original is 9. */
	blades?: number;
	/** Time multiplier — 1 is the canonical cadence; 0 freezes rotation. */
	spin?: number;
	/** Per-blade accumulation gain (exposure). The original bakes in 0.03 (=1×). */
	gain?: number;
	/** Hue phase (radians) added inside the colour sine. */
	hue?: number;
	/** Freeze the clock while keeping the last frame on screen. */
	paused?: boolean;
	/** Let the bloom centre ease toward the pointer. Default true. */
	pointerReact?: boolean;
	/** Clamp the device-pixel-ratio used for the drawing buffer. */
	pixelRatio?: number;
	/** Per-frame telemetry callback (write to refs; do not setState here). */
	onFrame?: (f: ApertureFrame) => void;
	className?: string;
	style?: React.CSSProperties;
}

const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** The radial bloom with 9 / 0.03 / hue-phase promoted to uniforms. */
export const APERTURE_FRAG = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;   // (width, height, dpr)
uniform float iTime;         // seconds (already scaled by spin on the CPU)
uniform vec4  iMouse;        // xy = bloom-centre offset, in device px
uniform float uBlades;       // promoted from the literal 9.0
uniform float uGain;         // promoted from the literal 0.03 accumulation gain
uniform float uHue;          // promoted hue phase added to the colour sine

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  r = iResolution.xy;
    float t = iTime;
    vec4  o = vec4(0.0);

    // Same centring as the original, plus an optional pointer-driven offset.
    vec2 p = fragCoord - (r * 0.5 + iMouse.xy);

    for (float i = 0.0, a = 0.0; i++ < 16.0; )
    {
        if (i > uBlades) break;

        a = (i * i) / 80.0 - length(p) / r.y;
        float denom = max(a, -a * 3.0) + 2.0 / r.y;

        a = cos(i - t);
        float edge0 = a;
        float edge1 = 2.0;
        a = atan(p.y, p.x) + a + i * i;
        float sm = smoothstep(edge0, edge1, cos(a));

        o += (0.03 * uGain) / denom * sm * (1.2 + sin(a + i + uHue + vec4(0.0, 2.0, 4.0, 0.0)));
    }

    o = tanh(o);
    fragColor = vec4(o.rgb, 1.0);
}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
	const sh = gl.createShader(type)!;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(sh));
		gl.deleteShader(sh);
		return null;
	}
	return sh;
}

export function ApertureCanvas({
	blades = 9,
	spin = 1,
	gain = 1,
	hue = 0,
	paused = false,
	pointerReact = true,
	pixelRatio,
	onFrame,
	className,
	style,
}: ApertureCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Live values read inside the rAF loop, refreshed every render so changing a
	// control never tears down the GL program.
	const live = useRef({ blades, spin, gain, hue, paused, pointerReact });
	live.current = { blades, spin, gain, hue, paused, pointerReact };
	const onFrameRef = useRef<ApertureCanvasProps["onFrame"]>(onFrame);
	onFrameRef.current = onFrame;

	useEffect(() => {
		const canvas = canvasRef.current!;
		// `!` keeps the rest of the effect typed as a live context; the runtime
		// guard below still bails on null.
		const gl = canvas.getContext("webgl2", { premultipliedAlpha: false })!;
		if (!gl) return;

		let disposed = false;

		const vao = gl.createVertexArray()!;
		gl.bindVertexArray(vao);
		const vbo = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 3, -1, -1, 3]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
		const fs = compile(gl, gl.FRAGMENT_SHADER, APERTURE_FRAG);
		if (!vs || !fs) return cleanup;
		const program = gl.createProgram()!;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			return cleanup;
		}

		const uResolution = gl.getUniformLocation(program, "iResolution");
		const uTime = gl.getUniformLocation(program, "iTime");
		const uMouse = gl.getUniformLocation(program, "iMouse");
		const uBlades = gl.getUniformLocation(program, "uBlades");
		const uGain = gl.getUniformLocation(program, "uGain");
		const uHue = gl.getUniformLocation(program, "uHue");

		const getDpr = () =>
			Math.max(1, Math.min(2, pixelRatio ?? window.devicePixelRatio ?? 1));

		let resizeScheduled = false;
		function applySize() {
			resizeScheduled = false;
			if (disposed) return;
			const dpr = getDpr();
			const cssW = Math.max(1, canvas.clientWidth | 0);
			const cssH = Math.max(1, canvas.clientHeight | 0);
			const w = Math.max(1, Math.floor(cssW * dpr));
			const h = Math.max(1, Math.floor(cssH * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl.viewport(0, 0, w, h);
			}
		}
		function scheduleSize() {
			if (resizeScheduled) return;
			resizeScheduled = true;
			requestAnimationFrame(applySize);
		}
		const ro = new ResizeObserver(scheduleSize);
		ro.observe(canvas);
		scheduleSize();

		// Pointer parallax: ease the bloom centre toward the cursor (device px).
		const offset = { x: 0, y: 0 };
		const target = { x: 0, y: 0 };
		function onMove(e: MouseEvent) {
			const rect = canvas.getBoundingClientRect();
			const dpr = getDpr();
			const px = (e.clientX - rect.left) * dpr;
			const py = (rect.height - (e.clientY - rect.top)) * dpr; // GL origin = bottom-left
			target.x = (px - canvas.width * 0.5) * 0.12;
			target.y = (py - canvas.height * 0.5) * 0.12;
		}
		function onLeave() {
			target.x = 0;
			target.y = 0;
		}
		canvas.addEventListener("mousemove", onMove);
		canvas.addEventListener("mouseleave", onLeave);

		let raf = 0;
		function onLost(ev: Event) {
			ev.preventDefault();
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
		}
		function onRestored() {
			scheduleSize();
			last = performance.now();
			if (!raf) raf = requestAnimationFrame(tick);
		}
		canvas.addEventListener("webglcontextlost", onLost);
		canvas.addEventListener("webglcontextrestored", onRestored);

		let last = performance.now();
		let clock = 0; // accumulated, spin-scaled seconds
		let frame = 0;
		let ema = 60;

		function tick(now: number) {
			if (disposed) return;
			if (gl.isContextLost()) {
				raf = requestAnimationFrame(tick);
				return;
			}
			const dtMs = Math.min(100, Math.max(0, now - last));
			last = now;
			if (dtMs > 0) ema = ema * 0.9 + (1000 / dtMs) * 0.1;

			const p = live.current;
			if (!p.paused) clock += (dtMs / 1000) * p.spin;
			frame += 1;

			if (resizeScheduled) applySize();

			// Ease pointer offset toward its target (or recenter when disabled).
			if (!p.pointerReact) {
				target.x = 0;
				target.y = 0;
			}
			offset.x += (target.x - offset.x) * 0.08;
			offset.y += (target.y - offset.y) * 0.08;

			gl.useProgram(program);
			gl.uniform3f(uResolution, canvas.width, canvas.height, getDpr());
			gl.uniform1f(uTime, clock);
			gl.uniform4f(uMouse, offset.x, offset.y, 0, 0);
			gl.uniform1f(uBlades, p.blades);
			gl.uniform1f(uGain, p.gain);
			gl.uniform1f(uHue, p.hue);
			gl.bindVertexArray(vao);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			onFrameRef.current?.({
				fps: ema,
				time: clock,
				frame,
				dpr: getDpr(),
				width: canvas.width,
				height: canvas.height,
			});

			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);

		function cleanup() {
			disposed = true;
			if (raf) cancelAnimationFrame(raf);
			canvas.removeEventListener("mousemove", onMove);
			canvas.removeEventListener("mouseleave", onLeave);
			canvas.removeEventListener("webglcontextlost", onLost);
			canvas.removeEventListener("webglcontextrestored", onRestored);
			ro.disconnect();
			try {
				gl.deleteBuffer(vbo);
			} catch {
				/* noop */
			}
			try {
				gl.deleteVertexArray(vao);
			} catch {
				/* noop */
			}
		}

		return cleanup;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pixelRatio]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={{ display: "block", width: "100%", height: "100%", ...style }}
		/>
	);
}

export default ApertureCanvas;
