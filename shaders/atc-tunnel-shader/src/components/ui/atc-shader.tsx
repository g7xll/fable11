// atc-shader.tsx
// ShaderDemo_ATC — the prompt's "ATC" one-liner ported to a shadcn `components/ui` piece.
//
// A single WebGL2 fullscreen fragment-shader pass. The fragment program ray-marches
// (`z += d`) through cosine-folded space with a per-fragment `mat2` rotation, building
// an iridescent, chromatic warp tunnel that drifts forever (`p.x += t / 0.2`).
//
// Faithful to the original demo: same GLSL, same vertex buffer, same render loop. The
// only additions are (1) the broken string-literal newline fixed to a real "\n", and
// (2) an optional `onSample` callback + `paused` prop so a host page can read the
// shader's own per-frame clock for telemetry without touching the draw path.
"use client";

import { useEffect, useRef } from "react";

const vertSrc = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos,0.0,1.0); }`;

const fragSrc = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  u_res;
uniform float u_time;

// robust tanh fallback
float tanh1(float x){ float e = exp(2.0*x); return (e-1.0)/(e+1.0); }
vec4 tanh4(vec4 v){ return vec4(tanh1(v.x), tanh1(v.y), tanh1(v.z), tanh1(v.w)); }

void main(){
  vec3 FC = vec3(gl_FragCoord.xy, 0.0);
  vec3 r  = vec3(u_res, max(u_res.x, u_res.y));
  float t = u_time;

  vec4 o = vec4(0.0);

  // === your code with safe inits & valid mat2 multiply, tanh replacement ===
  vec3 p = vec3(0.0);
  vec3 v = vec3(1.0, 2.0, 6.0);
  float i = 0.0, z = 1.0, d = 1.0, f = 1.0;

  for ( ; i++ < 5e1;
        o.rgb += (cos((p.x + z + v) * 0.1) + 1.0) / d / f / z )
  {
    p = z * normalize(FC * 2.0 - r.xyy);

    vec4 m = cos((p + sin(p)).y * 0.4 + vec4(0.0, 33.0, 11.0, 0.0));
    p.xz = mat2(m) * p.xz;

    p.x += t / 0.2;

    z += ( d = length(cos(p / v) * v + v.zxx / 7.0) /
           ( f = 2.0 + d / exp(p.y * 0.2) ) );
  }

  o = tanh4(0.2 * o);
  o.a = 1.0;
  fragColor = o;
}`;

export interface ShaderSample {
	/** Seconds since the shader started — the same `time` value driving `u_time`. */
	time: number;
	/** Smoothed frames-per-second sampled from requestAnimationFrame deltas. */
	fps: number;
}

export interface ShaderDemoATCProps {
	/** Freeze the render loop (the corridor holds its current frame). */
	paused?: boolean;
	/** Called ~2×/second with the shader's live clock + frame rate for HUD readouts. */
	onSample?: (s: ShaderSample) => void;
	className?: string;
}

export default function ShaderDemo_ATC({
	paused = false,
	onSample,
	className,
}: ShaderDemoATCProps) {
	const ref = useRef<HTMLCanvasElement>(null);
	const preRef = useRef<HTMLPreElement>(null);
	// Keep the latest callback/paused in refs so the render loop never re-binds.
	const onSampleRef = useRef(onSample);
	const pausedRef = useRef(paused);
	onSampleRef.current = onSample;
	pausedRef.current = paused;

	useEffect(() => {
		const canvas = ref.current!;
		const pre = preRef.current!;
		const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
		if (!gl) {
			pre.textContent = "WebGL2 not available";
			return;
		}

		const compile = (type: number, src: string) => {
			const sh = gl.createShader(type)!;
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
				throw new Error(gl.getShaderInfoLog(sh) || "compile error");
			return sh;
		};
		const link = (vs: string, fs: string) => {
			const p = gl.createProgram()!;
			gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
			gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
			gl.linkProgram(p);
			if (!gl.getProgramParameter(p, gl.LINK_STATUS))
				throw new Error(gl.getProgramInfoLog(p) || "link error");
			return p;
		};

		let prog: WebGLProgram;
		try {
			prog = link(vertSrc, fragSrc);
		} catch (e: unknown) {
			pre.textContent = `Shader error:\n${(e as Error).message}`;
			return;
		}

		gl.useProgram(prog);

		const buf = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		const uRes = gl.getUniformLocation(prog, "u_res");
		const uTime = gl.getUniformLocation(prog, "u_time");

		const resize = () => {
			const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
			const w = Math.floor((canvas.clientWidth || window.innerWidth) * dpr);
			const h = Math.floor((canvas.clientHeight || window.innerHeight) * dpr);
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			gl.viewport(0, 0, w, h);
			gl.uniform2f(uRes, w, h);
		};
		const onResize = () => resize();
		window.addEventListener("resize", onResize, { passive: true });
		resize();

		let raf = 0;
		const t0 = performance.now();
		let pausedAt = 0; // wall-clock time the loop was frozen, to hold the corridor still
		let frozen = 0; // total ms spent paused, subtracted so resume is seamless

		// Telemetry sampling — derive fps from real frame deltas, no decorative numbers.
		let last = t0;
		let acc = 0;
		let frames = 0;
		let fps = 60;

		const draw = (now: number) => {
			if (pausedRef.current) {
				if (!pausedAt) pausedAt = now;
				raf = requestAnimationFrame(draw);
				return;
			}
			if (pausedAt) {
				frozen += now - pausedAt;
				pausedAt = 0;
				last = now;
			}

			const time = (now - t0 - frozen) / 1000;
			gl.uniform1f(uTime, time);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			const dt = now - last;
			last = now;
			acc += dt;
			frames += 1;
			if (acc >= 500) {
				fps = Math.round((frames * 1000) / acc);
				acc = 0;
				frames = 0;
				onSampleRef.current?.({ time, fps });
			}

			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
			gl.deleteProgram(prog);
			gl.deleteBuffer(buf);
		};
	}, []);

	return (
		<div
			className={className}
			style={{ position: "relative", width: "100%", height: "100%" }}
		>
			<canvas
				ref={ref}
				style={{
					width: "100%",
					height: "100%",
					display: "block",
					background: "#000",
				}}
			/>
			<pre
				ref={preRef}
				style={{
					position: "absolute",
					top: 8,
					left: 8,
					margin: 0,
					color: "#0f0",
					whiteSpace: "pre-wrap",
					fontFamily: "var(--font-mono, ui-monospace, monospace)",
					fontSize: 11,
					pointerEvents: "none",
				}}
			/>
		</div>
	);
}
