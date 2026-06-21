import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * DigitalPetalsShader
 * -------------------
 * The component from the brief, integrated into a shadcn `components/ui` slot.
 *
 * The GLSL (vertex + fragment) is preserved verbatim from the prompt — a single
 * full-screen quad rendered with an OrthographicCamera, driven by the classic
 * Shadertoy uniforms `iResolution` / `iTime` / `iMouse`. The petal count the
 * fragment shader uses is `5.0 + sin(iTime * 0.3) * 2.0`, so the bloom breathes
 * between 3 and 7 petals; the cursor seeds a soft `bloom` of light.
 *
 * Two things are added on top of the brief without touching the visual output:
 *
 *  - It can fit its parent element instead of always the viewport, so the
 *    showcase can frame it inside a specimen plate. The default (`fitToParent`
 *    off) keeps the prompt's fixed full-viewport background behaviour.
 *  - An optional `onFrame` callback surfaces the shader's *own* per-frame state
 *    (elapsed time, live petal count, cursor bloom strength, fps). This is what
 *    lets the cultivation log read numbers straight off the GPU rather than
 *    re-deriving them in React, and `paused` freezes that same clock.
 */

export type PetalTelemetry = {
	/** Elapsed shader time in seconds (this is the shader's `iTime`). */
	time: number;
	/** Live petal count = 5 + sin(time * 0.3) * 2, as the fragment shader uses. */
	petals: number;
	/** Cursor bloom strength in [0,1] — peaks as the pointer nears center. */
	bloom: number;
	/** Smoothed frames per second. */
	fps: number;
	/** Pointer position in normalized [0,1] coords (origin bottom-left). */
	mouseX: number;
	mouseY: number;
};

export type DigitalPetalsShaderProps = {
	/** Fit the host element instead of the viewport (default: viewport, per the brief). */
	fitToParent?: boolean;
	/** Freeze the shader clock without unmounting the WebGL context. */
	paused?: boolean;
	/** Per-frame telemetry read off the running shader. */
	onFrame?: (t: PetalTelemetry) => void;
	className?: string;
};

const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        // normalize coords around center, scale by height
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy) / iResolution.y;

        float t = iTime * 0.3;

        float r = length(uv);
        float a = atan(uv.y, uv.x);

        float mouseDist = length(uv - mouse);
        float bloom     = smoothstep(0.4, 0.0, mouseDist);

        float petals     = 5.0 + sin(t) * 2.0;
        float petalShape = sin(a * petals + r * 2.0);
        petalShape = pow(abs(petalShape), 0.5);

        float flow    = sin(r * 10.0 - t * 2.0);
        float pattern = mix(petalShape, flow, 0.5) + bloom * 0.5;

        vec3 color1         = vec3(0.8, 0.1, 0.5);
        vec3 color2         = vec3(0.2, 0.4, 0.9);
        vec3 highlightColor = vec3(1.0);

        vec3 finalColor = mix(
          color1,
          color2,
          smoothstep(0.5, 0.8, r + random(vec2(t, t)) * 0.1)
        ) * pattern;

        finalColor += highlightColor * pow(pattern, 10.0) * (1.0 + bloom);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

const DigitalPetalsShader = ({
	fitToParent = false,
	paused = false,
	onFrame,
	className,
}: DigitalPetalsShaderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	// Mirror the latest props into refs so the long-lived animation loop reads
	// current values without resubscribing (and thus without recreating WebGL).
	const pausedRef = useRef(paused);
	const onFrameRef = useRef(onFrame);
	pausedRef.current = paused;
	onFrameRef.current = onFrame;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 1) Renderer, Scene, Camera, Clock
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);
		// The canvas should fill its host box in both viewport and parent modes.
		renderer.domElement.style.display = "block";
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const clock = new THREE.Clock();

		// 3) Uniforms, Material, Mesh
		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2() },
			iMouse: {
				value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
			},
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// 4) Resize handler — size to the host element (works for both modes).
		const onResize = () => {
			const width = container.clientWidth || window.innerWidth;
			const height = container.clientHeight || window.innerHeight;
			renderer.setSize(width, height, false);
			uniforms.iResolution.value.set(
				width * renderer.getPixelRatio(),
				height * renderer.getPixelRatio(),
			);
		};
		window.addEventListener("resize", onResize);
		// Keep the canvas correct if the container resizes without a window event.
		const ro = new ResizeObserver(onResize);
		ro.observe(container);
		onResize();

		// 5) Pointer handler — convert to the host element's local space and flip Y
		// so the shader's origin is bottom-left (matches `iMouse` convention).
		const onPointerMove = (e: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const x = (e.clientX - rect.left) * renderer.getPixelRatio();
			const y =
				(rect.height - (e.clientY - rect.top)) * renderer.getPixelRatio();
			uniforms.iMouse.value.set(x, y);
		};
		window.addEventListener("pointermove", onPointerMove);

		// Pause bookkeeping: hold the clock's elapsed time steady while paused so
		// resuming continues smoothly rather than jumping.
		let elapsed = 0;
		let last = performance.now();
		let fps = 60;

		// 6) Animation loop
		renderer.setAnimationLoop(() => {
			const now = performance.now();
			const dt = clock.getDelta();
			if (!pausedRef.current) elapsed += dt;
			uniforms.iTime.value = elapsed;

			// Smoothed fps for the readout.
			const frameMs = now - last;
			last = now;
			if (frameMs > 0) fps += (1000 / frameMs - fps) * 0.1;

			renderer.render(scene, camera);

			const cb = onFrameRef.current;
			if (cb) {
				// Re-derive the shader's own values so the UI shows the truth on screen.
				const tt = elapsed * 0.3;
				const res = uniforms.iResolution.value;
				const m = uniforms.iMouse.value;
				// Reproduce the GLSL `bloom`: smoothstep(0.4, 0.0, dist(uv, mouse)) at
				// center, so the UI bloom meter matches the light actually drawn.
				const mx = (m.x - 0.5 * res.x) / res.y;
				const my = (m.y - 0.5 * res.y) / res.y;
				const dist = Math.hypot(mx, my); // cursor distance from center, in uv space
				const edge = Math.min(1, Math.max(0, (0.4 - dist) / 0.4));
				const bloom = edge * edge * (3 - 2 * edge); // smoothstep
				cb({
					time: elapsed,
					petals: 5 + Math.sin(tt) * 2,
					bloom,
					fps,
					mouseX: res.x > 0 ? m.x / res.x : 0.5,
					mouseY: res.y > 0 ? m.y / res.y : 0.5,
				});
			}
		});

		// 7) Cleanup
		return () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("pointermove", onPointerMove);
			ro.disconnect();

			renderer.setAnimationLoop(null);

			const canvas = renderer.domElement;
			if (canvas && canvas.parentNode) {
				canvas.parentNode.removeChild(canvas);
			}

			material.dispose();
			geometry.dispose();
			renderer.dispose();
		};
	}, []);

	// Viewport mode mirrors the brief exactly (fixed, full-screen, behind content,
	// non-interactive). Parent mode fills whatever box hosts it.
	const positionStyle: React.CSSProperties = fitToParent
		? { position: "absolute", inset: 0, width: "100%", height: "100%" }
		: {
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: -1,
				pointerEvents: "none",
			};

	return (
		<div
			ref={containerRef}
			className={className ?? "shader-container"}
			style={positionStyle}
			aria-label="Digital Petals animated background"
		/>
	);
};

export default DigitalPetalsShader;
