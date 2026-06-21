import type React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CelestialInkShader
 * ------------------
 * A faithful TypeScript port of the integration brief's Three.js component:
 * an orthographic full-quad pass running an FBM "ink" fragment shader that
 * rotates over time and ripples around the pointer. The shader source (vertex,
 * fragment, uniforms, render loop, cleanup) is preserved verbatim from the
 * brief.
 *
 * Two things are added on top of the brief so the surrounding instrument can
 * actually *read* the shader instead of just hosting it:
 *
 *  - `freeze` / `inkSpeed` / `rippleGain` props promote the shader's baked-in
 *    constants (clock advance, time scale, ripple strength) to live controls.
 *  - `onFrame` streams the shader's own per-frame state back out (clock time,
 *    rotation angle, normalised ripple centre, fps) so the HUD telemetry is
 *    driven by the GPU pass rather than guessed at.
 *
 * With no props it behaves exactly like the brief's drop-in: a fixed,
 * pointer-reactive, full-viewport animated background.
 */

export interface InkFrame {
	/** Elapsed shader clock time in seconds (honours freeze). */
	time: number;
	/** Current rotation angle of the ink field, in radians. */
	angle: number;
	/** Pointer position normalised to the shader's -1..1 short-side space. */
	ripple: { x: number; y: number };
	/** Smoothed frames-per-second of the render loop. */
	fps: number;
}

export interface CelestialInkShaderProps {
	/** When true the ink clock stops advancing; the field holds in place. */
	freeze?: boolean;
	/** Multiplier on the ink's drift/rotation speed (1 = brief default). */
	inkSpeed?: number;
	/** Multiplier on the pointer ripple strength (1 = brief default). */
	rippleGain?: number;
	/** Per-frame telemetry from inside the render loop. */
	onFrame?: (frame: InkFrame) => void;
	/** Extra classes for the host element (defaults to the brief's fixed bg). */
	className?: string;
	/** Override the brief's fixed inline layout (e.g. to inset it in a frame). */
	fill?: boolean;
}

const CelestialInkShader: React.FC<CelestialInkShaderProps> = ({
	freeze = false,
	inkSpeed = 1,
	rippleGain = 1,
	onFrame,
	className,
	fill = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	// Props are read inside a single long-lived effect via refs so changing them
	// never tears down / re-creates the WebGL context.
	const freezeRef = useRef(freeze);
	const speedRef = useRef(inkSpeed);
	const gainRef = useRef(rippleGain);
	const onFrameRef = useRef(onFrame);
	freezeRef.current = freeze;
	speedRef.current = inkSpeed;
	gainRef.current = rippleGain;
	onFrameRef.current = onFrame;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 1) Renderer, Scene, Camera, Clock
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);
		renderer.domElement.style.display = "block";
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const clock = new THREE.Clock();

		// 2) GLSL Shaders — preserved from the integration brief.
		const vertexShader = /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

		const fragmentShader = /* glsl */ `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform float iSpeed;
      uniform float iRippleGain;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
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
        // normalize coords to -1..1 on short side
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy) / iResolution.y;
        float t     = iTime * 0.1 * iSpeed;

        // ripple around mouse
        float d = length(uv - mouse);
        float ripple = 1.0 - smoothstep(0.0, 0.3, d);

        // rotation
        float angle = t * 0.5;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 p = rot * uv;

        // ink patterns
        float pattern = fbm(p * 3.0 + t);
        pattern -= fbm(p * 6.0 - t * 0.5) * 0.3;
        pattern += ripple * 0.5 * iRippleGain;

        // color mix
        vec3 c1 = vec3(0.1, 0.0, 0.2);
        vec3 c2 = vec3(0.8, 0.2, 0.4);
        vec3 highlight = vec3(1.0, 0.9, 0.7);

        vec3 color = mix(c1, c2, smoothstep(0.4, 0.6, pattern));
        float hl = pow(smoothstep(0.6, 0.8, pattern), 2.0);
        color = mix(color, highlight, hl);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

		// 3) Uniforms, Material, Geometry, Mesh
		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2() },
			iMouse: {
				value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
			},
			iSpeed: { value: speedRef.current },
			iRippleGain: { value: gainRef.current },
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// 4) Resize handler
		const onResize = () => {
			const width = container.clientWidth || window.innerWidth;
			const height = container.clientHeight || window.innerHeight;
			renderer.setSize(width, height);
			uniforms.iResolution.value.set(
				width * renderer.getPixelRatio(),
				height * renderer.getPixelRatio(),
			);
		};
		window.addEventListener("resize", onResize);
		onResize();

		// 5) Mouse handler — track the pointer relative to the host element so the
		//    ripple sits under the cursor even when the shader is inset in a frame.
		const onMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = (e.clientX - rect.left) * renderer.getPixelRatio();
			const y =
				(rect.height - (e.clientY - rect.top)) * renderer.getPixelRatio();
			uniforms.iMouse.value.set(x, y);
		};
		window.addEventListener("mousemove", onMouseMove);

		// 6) Animation loop — advances a freeze-aware clock and streams telemetry.
		let inkTime = 0;
		let last = performance.now();
		let fps = 60;
		renderer.setAnimationLoop(() => {
			const delta = clock.getDelta();
			if (!freezeRef.current) inkTime += delta;

			uniforms.iTime.value = inkTime;
			uniforms.iSpeed.value = speedRef.current;
			uniforms.iRippleGain.value = gainRef.current;
			renderer.render(scene, camera);

			const nowMs = performance.now();
			const frameMs = nowMs - last;
			last = nowMs;
			if (frameMs > 0) fps += (1000 / frameMs - fps) * 0.1;

			const cb = onFrameRef.current;
			if (cb) {
				const res = uniforms.iResolution.value;
				const mouse = uniforms.iMouse.value;
				const rx = res.y > 0 ? (mouse.x - 0.5 * res.x) / res.y : 0;
				const ry = res.y > 0 ? (mouse.y - 0.5 * res.y) / res.y : 0;
				const t = inkTime * 0.1 * speedRef.current;
				cb({ time: inkTime, angle: t * 0.5, ripple: { x: rx, y: ry }, fps });
			}
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
			geometry.dispose();
			renderer.dispose();
		};
	}, []);

	// Default (no `fill`) matches the brief exactly: a fixed full-viewport,
	// pointer-transparent background sitting behind the page.
	const briefStyle: React.CSSProperties = {
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
			className={className}
			style={fill ? undefined : briefStyle}
			aria-label="Celestial Ink animated background"
		/>
	);
};

export default CelestialInkShader;
