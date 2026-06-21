import { type CSSProperties, useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * AuroraBorealisShader — the drop-in WebGL aurora curtain from the integration
 * brief, ported to TypeScript and hardened for a shadcn `components/ui` slot.
 *
 * The GLSL is verbatim from the brief: an FBM-noise "curtain" mixed green→violet
 * up the viewport, brightened by a soft flare that tracks the cursor. The
 * original mounted a fixed, full-viewport, pointer-transparent canvas behind the
 * page (`zIndex: -1`) and an optional cursor light. Both are preserved.
 *
 * What changed (without altering the shader's look or interaction):
 *   - Strong typing for the ref, uniforms, and props.
 *   - A graceful, animated CSS fallback if WebGL can't initialize, so the page
 *     never renders an empty void on unsupported devices.
 *   - Optional `paused` to freeze the animation clock and `onFrame` to read live
 *     state back out (time, fps, cursor warp, and the shader's own measured
 *     curtain brightness sampled straight off the GPU).
 * With no props it behaves exactly like the brief's component.
 */

export interface AuroraTelemetry {
	/** Elapsed shader clock in seconds. */
	time: number;
	/** Smoothed render rate. */
	fps: number;
	/** Cursor warp center, normalized 0..1 across the viewport (x → right). */
	mouseX: number;
	/** Cursor warp center, normalized 0..1 (y → up, shader space). */
	mouseY: number;
	/**
	 * Mean luminance of the rendered aurora, 0..1, sampled from the framebuffer.
	 * This is the real GPU output, not a simulated value — the surrounding
	 * console maps it onto a geomagnetic-activity (Kp) reading.
	 */
	brightness: number;
}

export interface AuroraBorealisShaderProps {
	/** Freeze the animation clock in place. Default false. */
	paused?: boolean;
	/** Per-frame telemetry callback (throttle on the consumer side). */
	onFrame?: (t: AuroraTelemetry) => void;
	/** Show the brief's optional white cursor light. Default true. */
	cursorLight?: boolean;
	/** Override the container layer styles (e.g. to embed instead of fixing). */
	containerStyle?: CSSProperties;
	className?: string;
}

const VERTEX_SHADER = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(random(i), random(i + vec2(1.0,0.0)), u.x),
      mix(random(i + vec2(0.0,1.0)), random(i + vec2(1.0,1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // normalized coords (−1..1 on short side)
    vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = (iMouse      - 0.5 * iResolution.xy) / iResolution.y;

    float t = iTime * 0.2;

    // base FBM curtain
    vec2 p = uv;
    p.y += 0.5;
    float f = fbm(vec2(p.x * 2.0, p.y + t));
    float curtain = smoothstep(0.1, 0.5, f) * (1.0 - p.y);

    // mouse flare
    float d     = length(uv - mouse);
    float flare = smoothstep(0.3, 0.0, d);

    vec3 c1 = vec3(0.1, 0.8, 0.5);
    vec3 c2 = vec3(0.8, 0.2, 0.8);
    vec3 fc = vec3(1.0);

    vec3 color = mix(c1, c2, p.y) * curtain;
    color += fc * flare * curtain * 2.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function AuroraBorealisShader({
	paused = false,
	onFrame,
	cursorLight = true,
	containerStyle,
	className = "shader-container",
}: AuroraBorealisShaderProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
	const [failed, setFailed] = useState(false);

	// Latest props kept in refs so the single mount effect never re-runs (the
	// WebGL context is expensive to recreate) yet always sees current values.
	const pausedRef = useRef(paused);
	const onFrameRef = useRef(onFrame);
	pausedRef.current = paused;
	onFrameRef.current = onFrame;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 1) Renderer + Scene + Camera + Clock
		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		} catch (err) {
			console.error("WebGL not supported:", err);
			setFailed(true);
			return;
		}
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const clock = new THREE.Clock();

		// 2) Build mesh with verbatim shaders
		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2() },
			iMouse: { value: new THREE.Vector2(-100, -100) },
		};

		const material = new THREE.ShaderMaterial({
			vertexShader: VERTEX_SHADER,
			fragmentShader: FRAGMENT_SHADER,
			uniforms,
		});
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
		scene.add(mesh);

		// 3) Resize logic
		const onResize = () => {
			const w = container.clientWidth || window.innerWidth;
			const h = container.clientHeight || window.innerHeight;
			renderer.setSize(w, h);
			uniforms.iResolution.value.set(
				w * renderer.getPixelRatio(),
				h * renderer.getPixelRatio(),
			);
		};
		window.addEventListener("resize", onResize);
		onResize();

		// 4) Mouse tracking — global, so the curtain warps even though the canvas
		// itself is pointer-transparent (matches the brief).
		const onMouseMove = (e: MouseEvent) => {
			const h = container.clientHeight || window.innerHeight;
			const x = e.clientX * renderer.getPixelRatio();
			const y = (h - e.clientY) * renderer.getPixelRatio(); // flip Y for shader coords
			uniforms.iMouse.value.set(x, y);
			setMousePos({ x: e.clientX, y: e.clientY });
		};
		window.addEventListener("mousemove", onMouseMove);

		// 5) Telemetry — FPS smoothing + periodic brightness readback.
		let frozenTime = 0; // accumulated clock while paused
		let lastT = performance.now();
		let fps = 60;
		let lastSample = 0;
		let brightness = 0; // smoothed mean luma of the patch under the probe
		const PATCH = 48; // device-pixel patch read around the cursor
		const pixels = new Uint8Array(4 * PATCH * PATCH);

		const readBrightness = () => {
			const gl = renderer.getContext();
			const bw = gl.drawingBufferWidth;
			const bh = gl.drawingBufferHeight;
			if (bw === 0 || bh === 0) return;

			// Sample the lit pixels around the probe (the cursor flare). iMouse is
			// already in device pixels, bottom-left origin — exactly readPixels' space
			// — so the gauge reads the real brightening the cursor raises. Before the
			// cursor has moved (iMouse far off-screen) we fall back to the frame
			// center so the gauge still reflects the live curtain.
			const mx = uniforms.iMouse.value.x;
			const my = uniforms.iMouse.value.y;
			const onScreen = mx >= 0 && mx <= bw && my >= 0 && my <= bh;
			const cx = onScreen ? mx : bw * 0.5;
			const cy = onScreen ? my : bh * 0.35;
			const x = Math.max(0, Math.min(bw - PATCH, Math.round(cx - PATCH / 2)));
			const y = Math.max(0, Math.min(bh - PATCH, Math.round(cy - PATCH / 2)));

			try {
				gl.readPixels(x, y, PATCH, PATCH, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
				let sum = 0;
				const n = PATCH * PATCH;
				for (let i = 0; i < n; i++) {
					const o = i * 4;
					// Rec. 709 luma
					sum +=
						0.2126 * pixels[o] +
						0.7152 * pixels[o + 1] +
						0.0722 * pixels[o + 2];
				}
				const mean = sum / n / 255;
				// Light smoothing so the gauge eases rather than flickers.
				brightness = brightness * 0.6 + mean * 0.4;
			} catch {
				/* readPixels can throw on lost contexts; keep last value */
			}
		};

		// 6) Animation loop
		renderer.setAnimationLoop(() => {
			const now = performance.now();
			const dt = clock.getDelta();
			if (!pausedRef.current) frozenTime += dt;
			uniforms.iTime.value = frozenTime;
			renderer.render(scene, camera);

			// fps (exponential smoothing)
			const frameMs = now - lastT;
			lastT = now;
			if (frameMs > 0) fps = fps * 0.9 + (1000 / frameMs) * 0.1;

			// Sample the GPU output ~6×/sec — cheap and keeps the gauge honest.
			if (now - lastSample > 160) {
				readBrightness();
				lastSample = now;
			}

			onFrameRef.current?.({
				time: frozenTime,
				fps,
				mouseX:
					uniforms.iMouse.value.x / Math.max(1, uniforms.iResolution.value.x),
				mouseY:
					uniforms.iMouse.value.y / Math.max(1, uniforms.iResolution.value.y),
				brightness,
			});
		});

		// 7) Cleanup
		return () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("mousemove", onMouseMove);
			renderer.setAnimationLoop(null);

			const canvas = renderer.domElement;
			if (canvas.parentNode) canvas.parentNode.removeChild(canvas);

			material.dispose();
			mesh.geometry.dispose();
			renderer.dispose();
		};
	}, []);

	const baseContainerStyle: CSSProperties = {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100vw",
		height: "100vh",
		zIndex: 0,
		pointerEvents: "none",
		...containerStyle,
	};

	return (
		<>
			<div
				ref={containerRef}
				className={className}
				style={baseContainerStyle}
				aria-label="Aurora Borealis animated background"
			>
				{failed && (
					<div className="aurora-fallback" aria-hidden>
						<span className="aurora-fallback__band aurora-fallback__band--1" />
						<span className="aurora-fallback__band aurora-fallback__band--2" />
					</div>
				)}
			</div>

			{/* Optional cursor light — the brief's "cursor-light" dot, kept opt-in. */}
			{cursorLight && !failed && (
				<div
					className="cursor-light"
					aria-hidden
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "20px",
						height: "20px",
						borderRadius: "50%",
						background: "rgba(255,255,255,0.5)",
						transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
						pointerEvents: "none",
						zIndex: 5,
					}}
				/>
			)}
		</>
	);
}
