import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Live telemetry the shader reports on every animation frame so a surrounding
 * UI (a HUD, a status bar, etc.) can read what the GPU is doing.
 */
export interface ShaderTelemetry {
	/** Frames per second, smoothed over a one-second window. */
	fps: number;
	/** Seconds elapsed since the shader started (the `u_time` uniform). */
	time: number;
	/** Drawing-buffer resolution in device pixels. */
	width: number;
	height: number;
	/** Normalized cursor position fed to `u_mouse` (0..1, y is bottom-up). */
	mouseX: number;
	mouseY: number;
}

export interface ShaderAnimationProps {
	/** Render the canvas full-window (default) or fill its parent box. */
	fill?: "window" | "parent";
	/** Whether the cursor distorts the field. Starts interactive, per the prompt. */
	interactive?: boolean;
	/** Freeze the clock without tearing down the GL context. */
	paused?: boolean;
	/** Number of fractal layers accumulated (1–6). Original behavior is 4. */
	layers?: number;
	/** Master glow gain on the accumulated fractal (0.2–2). */
	intensity?: number;
	/** Animation speed multiplier applied to `u_time` (0.1–3). */
	speed?: number;
	/** Render the built-in toggle button + title overlay (the prompt's chrome). */
	showOverlay?: boolean;
	/** Called once per frame with live GPU telemetry. */
	onTelemetry?: (t: ShaderTelemetry) => void;
	className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * Fragment shader: an animated fractal gradient field. This is the prompt's
 * shader, with the previously hard-coded constants (layer count = 4, glow gain,
 * time scale) lifted into uniforms so the surface can drive them live.
 */
const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_layers;
  uniform float u_intensity;

  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv0 = uv;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    float d = length(uv);
    vec3 col = vec3(0.0);

    // Create multiple animated layers (count is now uniform-driven).
    for (float i = 0.0; i < 6.0; i++) {
      if (i >= u_layers) break;

      uv = fract(uv * 1.5) - 0.5;

      d = length(uv) * exp(-length(uv0));
      vec3 color = palette(length(uv0) + i * 0.4 + u_time * 0.01);

      d = sin(d * 4.0 + u_time) / 36.0;
      d = pow(0.005 / d, 1.5);

      // Mouse interaction: a ripple radiating from the cursor.
      vec2 mouseEffect = u_mouse - uv0;
      float mouseDist = length(mouseEffect);
      d *= 1.0 + sin(mouseDist * 10.0 - u_time * 2.0) * 0.1;

      col += color * d * u_intensity;
    }

    // Wave distortion.
    float wave = sin(uv0.x * 2.0 + u_time) * 0.01;
    col += vec3(wave);

    // Gradient overlay (indigo -> magenta, the brand spectrum).
    vec3 gradient1 = vec3(0.1, 0.2, 0.5);
    vec3 gradient2 = vec3(0.9, 0.1, 0.4);
    vec3 gradientMix = mix(gradient1, gradient2, uv0.y + sin(u_time) * 0.2);
    col = mix(col, gradientMix, 0.3);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(
	gl: WebGLRenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));

const ShaderAnimation: React.FC<ShaderAnimationProps> = ({
	fill = "window",
	interactive: interactiveProp,
	paused = false,
	layers = 4,
	intensity = 1,
	speed = 1,
	showOverlay = true,
	onTelemetry,
	className,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationRef = useRef<number | null>(null);
	const mouseRef = useRef({ x: 0.5, y: 0.5 });

	// The built-in toggle owns its own state when no `interactive` prop is
	// supplied, so the component is fully functional standalone (matches the
	// prompt's behavior); if controlled, the prop wins.
	const [isInteractive, setIsInteractive] = useState(interactiveProp ?? true);
	useEffect(() => {
		if (interactiveProp !== undefined) setIsInteractive(interactiveProp);
	}, [interactiveProp]);

	// Live values read inside the rAF loop without re-subscribing the effect.
	const liveRef = useRef({ paused, layers, intensity, speed, onTelemetry });
	liveRef.current = { paused, layers, intensity, speed, onTelemetry };
	const interactiveRef = useRef(isInteractive);
	interactiveRef.current = isInteractive;

	const [glError, setGlError] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl");
		if (!gl) {
			console.error("WebGL not supported");
			setGlError(true);
			return;
		}

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragmentShader = createShader(
			gl,
			gl.FRAGMENT_SHADER,
			FRAGMENT_SHADER,
		);
		if (!vertexShader || !fragmentShader) {
			setGlError(true);
			return;
		}

		const program = gl.createProgram();
		if (!program) {
			setGlError(true);
			return;
		}
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("Program linking error:", gl.getProgramInfoLog(program));
			setGlError(true);
			return;
		}

		// Full-screen quad.
		const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(program, "a_position");
		const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
		const timeLocation = gl.getUniformLocation(program, "u_time");
		const mouseLocation = gl.getUniformLocation(program, "u_mouse");
		const layersLocation = gl.getUniformLocation(program, "u_layers");
		const intensityLocation = gl.getUniformLocation(program, "u_intensity");

		// Size the drawing buffer to the canvas's CSS box (capped DPR for perf).
		const sizeTo = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const rect = canvas.getBoundingClientRect();
			const w = Math.max(
				1,
				Math.round((rect.width || window.innerWidth) * dpr),
			);
			const h = Math.max(
				1,
				Math.round((rect.height || window.innerHeight) * dpr),
			);
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl.viewport(0, 0, w, h);
			}
		};
		sizeTo();
		window.addEventListener("resize", sizeTo);

		const handleMouseMove = (e: MouseEvent) => {
			if (!interactiveRef.current) return;
			const rect = canvas.getBoundingClientRect();
			mouseRef.current.x = (e.clientX - rect.left) / rect.width;
			mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
		};
		window.addEventListener("mousemove", handleMouseMove);

		// Clock that can be frozen while paused (no tear-down, just stop advancing).
		let clock = 0;
		let last = performance.now();

		// FPS smoothing over a rolling one-second window.
		let frames = 0;
		let fpsWindowStart = performance.now();
		let fps = 0;

		const render = () => {
			const now = performance.now();
			const dt = (now - last) / 1000;
			last = now;

			const {
				paused: isPaused,
				layers: l,
				intensity: gain,
				speed: spd,
			} = liveRef.current;
			if (!isPaused) clock += dt * spd;

			frames += 1;
			if (now - fpsWindowStart >= 500) {
				fps = Math.round((frames * 1000) / (now - fpsWindowStart));
				frames = 0;
				fpsWindowStart = now;
			}

			sizeTo();

			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.uniform1f(timeLocation, clock);
			gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
			gl.uniform1f(layersLocation, clamp(Math.round(l), 1, 6));
			gl.uniform1f(intensityLocation, clamp(gain, 0.2, 2));

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			liveRef.current.onTelemetry?.({
				fps,
				time: clock,
				width: canvas.width,
				height: canvas.height,
				mouseX: mouseRef.current.x,
				mouseY: mouseRef.current.y,
			});

			animationRef.current = requestAnimationFrame(render);
		};
		render();

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			window.removeEventListener("resize", sizeTo);
			window.removeEventListener("mousemove", handleMouseMove);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
		};
	}, []);

	return (
		<div
			className={cn(
				"shader-container relative overflow-hidden bg-ink",
				fill === "window" ? "fixed inset-0" : "absolute inset-0",
				className,
			)}
		>
			<canvas
				ref={canvasRef}
				className="shader-canvas block h-full w-full"
				aria-hidden="true"
			/>

			{glError && (
				<div className="absolute inset-0 grid place-items-center px-6 text-center">
					<p className="font-mono text-sm text-haze">
						WebGL is unavailable in this browser, so the shader can&rsquo;t run.
					</p>
				</div>
			)}

			{showOverlay && (
				<>
					<div className="controls absolute right-5 top-5 z-10">
						<button
							type="button"
							className={cn(
								"interactive-toggle inline-flex items-center gap-2 rounded-full border border-line",
								"bg-glass px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-paper",
								"backdrop-blur-md transition-colors hover:border-indigo/60",
							)}
							aria-pressed={isInteractive}
							onClick={() => setIsInteractive((v) => !v)}
						>
							{isInteractive ? "🖱️ Interactive" : "🚫 Static"}
						</button>
					</div>

					<div className="content-overlay pointer-events-none absolute inset-x-0 bottom-16 z-10 px-6 text-center">
						<h1 className="title font-display text-5xl font-bold tracking-tight text-paper sm:text-6xl">
							Shader Animation
						</h1>
						<p className="subtitle mt-2 font-mono text-sm uppercase tracking-[0.3em] text-haze">
							WebGL-powered flowing gradients
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default ShaderAnimation;
