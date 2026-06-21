"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// =================================
//  1. The Shader Component
// =================================
//
// This is the component from the integration brief, integrated verbatim: the
// vertex/fragment GLSL, the orthographic full-screen plane, the requestAnimation-
// Frame loop, the mouse-driven `u_mouse` warp, the resize handler and the cleanup
// are all unchanged from the prompt.
//
// Two additive, backwards-compatible extensions are layered on top so the
// surrounding "navigator console" can drive and read the shader without ever
// tearing down the WebGL context:
//   • live props are mirrored into refs and pushed onto the uniforms each frame,
//     so the control faders (hue / speed / zoom / particleSize) update in place
//     instead of recreating the renderer on every change;
//   • an optional `onFrame` callback emits the shader's own per-frame state
//     (shader time, smoothed FPS, the live warp offset and the active uniforms)
//     so an external HUD reads the GPU instead of guessing.
// Every prop keeps the brief's original default, so `<CelestialSphere />` with
// no props behaves exactly as the original did.

export interface CelestialFrame {
	/** Accumulated shader time (the `u_time` uniform). */
	time: number;
	/** Smoothed frames-per-second. */
	fps: number;
	/** Live mouse warp offset in clip space, the actual shift applied to `uv`. */
	warpX: number;
	warpY: number;
	/** Device pixel ratio the renderer is sampling at. */
	pixelRatio: number;
	/** Active uniform values, echoed back for the readouts. */
	hue: number;
	zoom: number;
	particleSize: number;
}

interface CelestialSphereProps {
	hue?: number;
	speed?: number;
	zoom?: number;
	particleSize?: number;
	className?: string;
	/** Optional probe fired once per animation frame with live shader state. */
	onFrame?: (frame: CelestialFrame) => void;
}

export const CelestialSphere: React.FC<CelestialSphereProps> = ({
	hue = 200.0,
	speed = 0.3,
	zoom = 1.5,
	particleSize = 3.0,
	className = "",
	onFrame,
}) => {
	const mountRef = useRef<HTMLDivElement>(null);

	// Mirror live props into refs so the animation loop reads fresh values
	// without re-running the effect (which would rebuild the WebGL context).
	const hueRef = useRef(hue);
	const speedRef = useRef(speed);
	const zoomRef = useRef(zoom);
	const particleSizeRef = useRef(particleSize);
	const onFrameRef = useRef(onFrame);
	hueRef.current = hue;
	speedRef.current = speed;
	zoomRef.current = zoom;
	particleSizeRef.current = particleSize;
	onFrameRef.current = onFrame;

	useEffect(() => {
		if (!mountRef.current) return;

		const currentMount = mountRef.current;
		let scene: THREE.Scene,
			camera: THREE.OrthographicCamera,
			renderer: THREE.WebGLRenderer,
			material: THREE.ShaderMaterial,
			mesh: THREE.Mesh;
		let animationFrameId: number;
		const mouse = new THREE.Vector2(0.5, 0.5);

		// Telemetry bookkeeping (additive — does not touch the shader math).
		let lastFrameTs = performance.now();
		let fpsSmoothed = 0;

		// --- Shaders --- (verbatim from the brief)
		const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

		const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hue;
      uniform float u_zoom;
      uniform float u_particle_size;

      // HSL to RGB conversion
      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      // 2D Random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // 2D Noise function
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
      }

      // Fractional Brownian Motion
      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        uv *= u_zoom;

        // Warp effect based on mouse
        vec2 mouse_normalized = u_mouse / u_resolution;
        uv += (mouse_normalized - 0.5) * 0.8;

        // Time-varying noise for nebula clouds
        float f = fbm(uv + vec2(u_time * 0.1, u_time * 0.05));
        float t = fbm(uv + f + vec2(u_time * 0.05, u_time * 0.02));

        // Final color calculation
        float nebula = pow(t, 2.0);
        vec3 color = hsl2rgb(vec3(u_hue / 360.0 + nebula * 0.2, 0.7, 0.5));
        color *= nebula * 2.5;

        // Starfield
        float star_val = random(vUv * 500.0);
        if (star_val > 0.998) {
            float star_brightness = (star_val - 0.998) / 0.002;
            color += vec3(star_brightness * u_particle_size);
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `;

		// --- Scene Initialization ---
		const init = () => {
			scene = new THREE.Scene();
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			renderer = new THREE.WebGLRenderer({ antialias: true });
			// Clamp pixel ratio so high-DPI displays stay smooth (the FBM is heavy).
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.domElement.style.display = "block";
			currentMount.appendChild(renderer.domElement);

			material = new THREE.ShaderMaterial({
				vertexShader,
				fragmentShader,
				uniforms: {
					u_time: { value: 0.0 },
					u_resolution: { value: new THREE.Vector2() },
					u_mouse: { value: new THREE.Vector2() },
					u_hue: { value: hueRef.current },
					u_zoom: { value: zoomRef.current },
					u_particle_size: { value: particleSizeRef.current },
				},
			});

			const geometry = new THREE.PlaneGeometry(2, 2);
			mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);

			addEventListeners();
			resize();
			animate();
		};

		// --- Animation Loop ---
		const animate = () => {
			// Live prop values pushed onto the uniforms (additive).
			material.uniforms.u_hue.value = hueRef.current;
			material.uniforms.u_zoom.value = zoomRef.current;
			material.uniforms.u_particle_size.value = particleSizeRef.current;

			material.uniforms.u_time.value += 0.005 * speedRef.current;
			renderer.render(scene, camera);

			// Telemetry (additive) — smoothed fps + the live warp offset that the
			// shader applies to `uv`: `(u_mouse / u_resolution - 0.5) * 0.8`.
			const now = performance.now();
			const dt = now - lastFrameTs;
			lastFrameTs = now;
			if (dt > 0) {
				const instant = 1000 / dt;
				fpsSmoothed = fpsSmoothed ? fpsSmoothed * 0.9 + instant * 0.1 : instant;
			}
			const res = material.uniforms.u_resolution.value as THREE.Vector2;
			const m = material.uniforms.u_mouse.value as THREE.Vector2;
			const warpX = res.x ? (m.x / res.x - 0.5) * 0.8 : 0;
			const warpY = res.y ? (m.y / res.y - 0.5) * 0.8 : 0;
			onFrameRef.current?.({
				time: material.uniforms.u_time.value,
				fps: fpsSmoothed,
				warpX,
				warpY,
				pixelRatio: renderer.getPixelRatio(),
				hue: hueRef.current,
				zoom: zoomRef.current,
				particleSize: particleSizeRef.current,
			});

			animationFrameId = requestAnimationFrame(animate);
		};

		// --- Event Handlers ---
		const resize = () => {
			const { clientWidth, clientHeight } = currentMount;
			renderer.setSize(clientWidth, clientHeight);
			material.uniforms.u_resolution.value.set(clientWidth, clientHeight);
			camera.updateProjectionMatrix();
		};

		const onMouseMove = (event: MouseEvent) => {
			const rect = currentMount.getBoundingClientRect();
			mouse.x = event.clientX - rect.left;
			mouse.y = event.clientY - rect.top;
			material.uniforms.u_mouse.value.set(
				mouse.x,
				currentMount.clientHeight - mouse.y,
			);
		};

		const addEventListeners = () => {
			window.addEventListener("resize", resize);
			window.addEventListener("mousemove", onMouseMove);
		};

		const removeEventListeners = () => {
			window.removeEventListener("resize", resize);
			window.removeEventListener("mousemove", onMouseMove);
		};

		init();

		// --- Cleanup ---
		return () => {
			removeEventListeners();
			cancelAnimationFrame(animationFrameId);
			if (currentMount && renderer.domElement) {
				currentMount.removeChild(renderer.domElement);
			}
			renderer.dispose();
		};
		// Intentionally run once: live prop changes flow through refs above, so we
		// never rebuild the WebGL context (which would flash the canvas).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div ref={mountRef} className={className || "w-full h-full"} />;
};

export default CelestialSphere;
