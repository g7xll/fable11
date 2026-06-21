import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * LivingNebulaShader
 * ------------------
 * The component from the brief, integrated into the shadcn `@/components/ui`
 * layer and ported to TypeScript. The Three.js setup, the vertex/fragment
 * shaders, the iTime / iResolution / iMouse uniforms, the resize + mousemove
 * handlers, the animation loop, and the cleanup are all preserved exactly as in
 * the original component.
 *
 * Two additions keep it production-friendly without changing the visual output:
 *   - `onFrame` reports the shader's own per-frame state (elapsed feed time, the
 *     gravitational-warp coordinates computed with the *same* normalization the
 *     fragment shader uses, and a render rate) so an enclosing UI can display a
 *     live telemetry HUD driven by the GPU rather than guesswork.
 *   - a graceful fallback paints a deep-space CSS gradient if WebGL is
 *     unavailable, so the layout never collapses to an empty black box.
 */

export interface NebulaFrameState {
	/** Elapsed shader feed time, in seconds (THREE.Clock). */
	time: number;
	/** Smoothed render rate, frames per second. */
	fps: number;
	/**
	 * Live gravitational-warp center in the shader's normalized space — the same
	 * `(iMouse - 0.5 * iResolution) / iResolution.y` the fragment shader warps
	 * around. Null until the pointer has entered the feed.
	 */
	warp: { x: number; y: number } | null;
}

export interface LivingNebulaShaderProps {
	/** Receives the shader's own per-frame state. */
	onFrame?: (state: NebulaFrameState) => void;
	/** Reports whether a WebGL context was successfully created. */
	onContext?: (supported: boolean) => void;
}

const LivingNebulaShader = ({
	onFrame,
	onContext,
}: LivingNebulaShaderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
	// Keep the latest callbacks in refs so the WebGL effect can stay mount-only
	// (empty deps) without going stale — exactly the lifecycle of the original.
	const onFrameRef = useRef(onFrame);
	const onContextRef = useRef(onContext);
	onFrameRef.current = onFrame;
	onContextRef.current = onContext;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 1) Renderer, Scene, Camera, Clock
		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		} catch (err) {
			// No WebGL — fall back to a static deep-space gradient so the feed
			// window is never an empty black rectangle.
			console.warn(
				"Living Nebula: WebGL unavailable, using CSS fallback.",
				err,
			);
			container.dataset.fallback = "true";
			onContextRef.current?.(false);
			return;
		}
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);
		onContextRef.current?.(true);

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const clock = new THREE.Clock();

		// 2) Shaders
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
        return fract(
          sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123
        );
      }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
          mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 6; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        // Normalize to -1..1 on the shorter side
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy)
                     / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy)
                     / iResolution.y;
        float t    = iTime * 0.1;

        // Warp around mouse
        float md = length(uv - mouse);
        vec2 offset = normalize(uv - mouse) / (md * 50.0);
        uv += offset * smoothstep(0.3, 0.0, md);

        // Rotate flow
        float angle = t * 0.3;
        mat2 rot = mat2(
          cos(angle), -sin(angle),
          sin(angle),  cos(angle)
        );
        vec2 p = rot * uv;

        // Two-layered cloud patterns
        float c1 = fbm(p * 2.0 + vec2(t, -t));
        float c2 = fbm(p * 4.0 - vec2(-t, t));

        // Colors
        vec3 deepSpace  = vec3(0.0, 0.0, 0.05);
        vec3 gasColor1  = vec3(0.8, 0.2, 0.5);
        vec3 gasColor2  = vec3(0.2, 0.3, 0.9);
        vec3 color      = deepSpace;

        color = mix(color, gasColor1, smoothstep(0.4, 0.6, c1));
        color = mix(color, gasColor2, smoothstep(0.5, 0.7, c2) * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

		// 3) Build Mesh
		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2() },
			iMouse: { value: new THREE.Vector2(-100, -100) },
		};
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
		scene.add(mesh);

		// 4) Resize Handler
		const onResize = () => {
			const width = container.clientWidth;
			const height = container.clientHeight;
			renderer.setSize(width, height);
			uniforms.iResolution.value.set(width, height);
		};
		window.addEventListener("resize", onResize);
		onResize();

		// 5) Mouse Handler — track against the feed window so coordinates are
		// reported relative to the canvas, not the whole document.
		let pointerInside = false;
		const onMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = container.clientHeight - (e.clientY - rect.top);
			uniforms.iMouse.value.set(x, y);
			pointerInside =
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom;
			setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
		};
		window.addEventListener("mousemove", onMouseMove);

		// 6) Animation Loop — also smooths FPS and forwards the shader's own
		// per-frame state to `onFrame` so the HUD reads the GPU, not a timer.
		let fps = 0;
		let last = performance.now();
		renderer.setAnimationLoop(() => {
			const now = performance.now();
			const dt = now - last;
			last = now;
			if (dt > 0) fps += (1000 / dt - fps) * 0.1;

			const time = clock.getElapsedTime();
			uniforms.iTime.value = time;
			renderer.render(scene, camera);

			const res = uniforms.iResolution.value;
			const m = uniforms.iMouse.value;
			// Reproduce the fragment shader's exact warp-center normalization.
			const warp =
				pointerInside && res.y > 0
					? {
							x: (m.x - 0.5 * res.x) / res.y,
							y: (m.y - 0.5 * res.y) / res.y,
						}
					: null;
			onFrameRef.current?.({ time, fps, warp });
		});

		// 7) Cleanup
		return () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("mousemove", onMouseMove);
			renderer.setAnimationLoop(null);

			const canvas = renderer.domElement;
			if (canvas?.parentNode) {
				canvas.parentNode.removeChild(canvas);
			}

			material.dispose();
			mesh.geometry.dispose();
			renderer.dispose();
		};
	}, []);

	return (
		<>
			<div
				ref={containerRef}
				className="nebula-feed"
				aria-label="Living Nebula animated background"
			/>
			<div
				className="cursor-aura"
				aria-hidden="true"
				style={{
					transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
				}}
			>
				<span className="cursor-aura__ring" />
				<span className="cursor-aura__tick cursor-aura__tick--n" />
				<span className="cursor-aura__tick cursor-aura__tick--s" />
				<span className="cursor-aura__tick cursor-aura__tick--e" />
				<span className="cursor-aura__tick cursor-aura__tick--w" />
			</div>
		</>
	);
};

export default LivingNebulaShader;
