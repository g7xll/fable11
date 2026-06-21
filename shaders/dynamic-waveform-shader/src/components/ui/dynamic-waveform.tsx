import React, { useRef, useEffect, memo } from "react";
import * as THREE from "three";

// --- GLSL Shaders ---
const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_complexity;
  uniform float u_amplitude;
  uniform float u_frequency;
  uniform float u_mouse_distortion;

  // 2D Random
  float random(vec2 p) {
    return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // --- Wave Generation ---
    float y = uv.y;
    float waveSum = 0.0;
    for (float i = 1.0; i <= 8.0; i++) {
      if (i > u_complexity) break;
      float freq = i * (u_frequency + 2.0);
      float amp  = (u_amplitude / i) * 0.2;
      float speed = u_time * (i * 0.5);

      // mouse-driven distortion
      float mEff = 1.0 + (u_mouse.y - 0.5) * u_mouse_distortion * i;
      waveSum += sin(uv.x * freq * mEff + speed) * amp;
    }
    y += waveSum;

    // --- Line + Glow ---
    float lineW  = 0.01;
    float glowW  = 0.1;
    float line   = smoothstep(lineW, 0.0, abs(uv.y - y));
    float glow   = smoothstep(glowW, 0.0, abs(uv.y - y));

    // --- Color Mix ---
    vec3 base = mix(u_color1, u_color2, smoothstep(0.3, 0.7, y));
    vec3 color = base * line + base * glow * 0.5;

    // --- Static Noise Overlay ---
    float noise = (random(uv + u_time) - 0.5) * 0.05;
    color += noise;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface ShaderCanvasProps {
	color1?: THREE.Color | string | number;
	color2?: THREE.Color | string | number;
	complexity?: number;
	amplitude?: number;
	frequency?: number;
	mouseDistortion?: number;
	speed?: number;
	/**
	 * Optional per-frame telemetry callback. Fires once per rendered frame with
	 * the shader's own live state (elapsed shader time + the mouse uniform), so a
	 * surrounding instrument HUD can read the trace straight off the render loop
	 * instead of faking it.
	 */
	onFrame?: (state: { time: number; mouseY: number }) => void;
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = memo(
	({
		color1 = "#ff4444",
		color2 = "#4444ff",
		complexity = 8,
		amplitude = 1,
		frequency = 1,
		mouseDistortion = 0.5,
		speed = 1,
		onFrame,
	}) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const threeRef = useRef<any>({});
		// Keep the latest onFrame in a ref so the render loop never goes stale and
		// changing the callback identity does not tear down the WebGL context.
		const onFrameRef = useRef(onFrame);
		onFrameRef.current = onFrame;

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			// 1. Scene, Camera
			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			// 2. Renderer (solid background)
			const renderer = new THREE.WebGLRenderer();
			renderer.setClearColor(0x000000, 1); // black bg
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.setSize(container.clientWidth, container.clientHeight);
			container.appendChild(renderer.domElement);

			// 3. Uniforms (incl. initial props)
			const uniforms = {
				u_time: { value: 0.0 },
				u_resolution: {
					value: new THREE.Vector2(
						container.clientWidth,
						container.clientHeight,
					),
				},
				u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
				u_color1: { value: new THREE.Color(color1) },
				u_color2: { value: new THREE.Color(color2) },
				u_complexity: { value: complexity },
				u_amplitude: { value: amplitude },
				u_frequency: { value: frequency },
				u_mouse_distortion: { value: mouseDistortion },
			};

			// 4. Fullscreen quad
			const geo = new THREE.PlaneGeometry(2, 2);
			const mat = new THREE.ShaderMaterial({
				uniforms,
				vertexShader,
				fragmentShader,
			});
			const mesh = new THREE.Mesh(geo, mat);
			scene.add(mesh);

			// 5. Clock & speed
			const clock = new THREE.Clock();
			threeRef.current = { renderer, scene, camera, uniforms, clock, speed };

			// 6. Resize handler — sizes to the container so the trace fills whatever
			// box it is mounted in (full viewport here, via fixed inset:0). Arrow
			// const (not a hoisted `function`) so TS keeps `container` narrowed.
			const onResize = () => {
				const W = container.clientWidth;
				const H = container.clientHeight;
				renderer.setSize(W, H);
				uniforms.u_resolution.value.set(W, H);
			};
			window.addEventListener("resize", onResize);
			onResize();

			// 7. Mouse handler — normalised, origin bottom-left to match GLSL uv.
			const onMouse = (e: MouseEvent) => {
				const rect = container.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width;
				const y = 1.0 - (e.clientY - rect.top) / rect.height;
				uniforms.u_mouse.value.set(x, y);
			};
			window.addEventListener("mousemove", onMouse);

			// 8. Render loop
			let id: number;
			const loop = () => {
				const { clock, uniforms } = threeRef.current;
				const t = clock.getElapsedTime() * threeRef.current.speed;
				uniforms.u_time.value = t;
				renderer.render(scene, camera);
				onFrameRef.current?.({ time: t, mouseY: uniforms.u_mouse.value.y });
				id = requestAnimationFrame(loop);
			};
			loop();

			// 9. Cleanup — uses the snapshotted `container`/`renderer`, so it stays
			// correct under StrictMode's mount/unmount/mount cycle (no orphan canvas).
			return () => {
				cancelAnimationFrame(id);
				window.removeEventListener("resize", onResize);
				window.removeEventListener("mousemove", onMouse);
				geo.dispose();
				mat.dispose();
				renderer.dispose();
				if (container.contains(renderer.domElement)) {
					container.removeChild(renderer.domElement);
				}
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// Keep uniforms in sync if props change
		useEffect(() => {
			const { uniforms } = threeRef.current;
			if (!uniforms) return;
			uniforms.u_color1.value.set(color1);
			uniforms.u_color2.value.set(color2);
			uniforms.u_complexity.value = complexity;
			uniforms.u_amplitude.value = amplitude;
			uniforms.u_frequency.value = frequency;
			uniforms.u_mouse_distortion.value = mouseDistortion;
			threeRef.current.speed = speed;
		}, [
			color1,
			color2,
			complexity,
			amplitude,
			frequency,
			mouseDistortion,
			speed,
		]);

		// Fill the mount box with a fallback background
		return (
			<div
				ref={containerRef}
				style={{
					position: "fixed",
					inset: 0,
					background: "#000",
					overflow: "hidden",
				}}
			/>
		);
	},
);

ShaderCanvas.displayName = "ShaderCanvas";

export default ShaderCanvas;
