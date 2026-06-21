import { useEffect, useRef } from "react";
import * as THREE from "three";

export type MoltenCoreTheme = "light" | "dark" | "system";

export interface MoltenCoreShaderProps {
	/**
	 * Drives the shader's `theme` uniform. `dark` melts the lava onto black,
	 * `light` onto white, and `system` mirrors the OS color-scheme preference
	 * (the behaviour of the original component). Defaults to `"system"`.
	 */
	theme?: MoltenCoreTheme;
	/**
	 * Blend of lava over the base color (the original used a fixed 0.8).
	 * Clamped to 0–1. Lower values let more of the base tone show through.
	 */
	intensity?: number;
	/**
	 * Optional probe. Fired roughly 12×/s with the average luminance of the
	 * rendered frame (0–1), so an external HUD can read the "core temperature"
	 * straight off the GPU instead of guessing.
	 */
	onSample?: (luminance: number) => void;
	className?: string;
}

const resolveTheme = (theme: MoltenCoreTheme): number => {
	if (theme === "dark") return 1;
	if (theme === "light") return 0;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? 1 : 0;
};

const MoltenCoreShader = ({
	theme = "system",
	intensity = 0.8,
	onSample,
	className,
}: MoltenCoreShaderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	// Keep mutable copies so the animation loop reads fresh values without
	// tearing down the WebGL context on every prop change.
	const themeRef = useRef(theme);
	const intensityRef = useRef(intensity);
	const sampleRef = useRef(onSample);
	themeRef.current = theme;
	intensityRef.current = intensity;
	sampleRef.current = onSample;

	useEffect(() => {
		const container = containerRef.current;
		if (!container || typeof THREE === "undefined") return;

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const clock = new THREE.Clock();

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);
		renderer.domElement.style.display = "block";

		const vertexShader = /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

		const fragmentShader = /* glsl */ `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float theme;
      uniform float intensity;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

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
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        uv.x *= iResolution.x / iResolution.y;

        float t = iTime * 0.2;
        vec2 motion = vec2(t * 0.5, t * 0.2);
        vec2 q = uv * 3.0;

        float n1 = fbm(q + motion);
        float n2 = fbm(q * 2.0 - motion);
        float combined_noise = n1 + n2 * 0.5;

        vec3 color1 = vec3(0.1, 0.0, 0.0);
        vec3 color2 = vec3(0.8, 0.2, 0.0);
        vec3 color3 = vec3(1.0, 0.5, 0.0);
        vec3 color4 = vec3(1.0, 0.9, 0.3);

        vec3 lava = mix(color1, color2, smoothstep(0.3, 0.45, combined_noise));
        lava = mix(lava, color3, smoothstep(0.5, 0.6, combined_noise));
        lava = mix(lava, color4, smoothstep(0.7, 0.75, combined_noise));

        float vignette = 1.0 - length(uv - 0.5) * 0.8;
        lava *= vignette;

        vec3 base = mix(vec3(1.0), vec3(0.0), theme); // white for light, black for dark
        vec3 finalColor = mix(base, lava, intensity);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

		const uniforms = {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2() },
			theme: { value: resolveTheme(themeRef.current) },
			intensity: { value: THREE.MathUtils.clamp(intensityRef.current, 0, 1) },
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const onResize = () => {
			const { clientWidth, clientHeight } = container;
			renderer.setSize(clientWidth, clientHeight);
			uniforms.iResolution.value.set(clientWidth, clientHeight);
		};
		onResize();
		window.addEventListener("resize", onResize);

		// React to OS theme flips while in "system" mode.
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onScheme = () => {
			if (themeRef.current === "system") {
				uniforms.theme.value = resolveTheme("system");
			}
		};
		media.addEventListener("change", onScheme);

		// Smoothly ease the theme uniform so toggles cross-fade instead of snapping.
		let frameId = 0;
		let lastSample = 0;
		const sampleBuffer = new Uint8Array(4);
		const animate = () => {
			uniforms.iTime.value = clock.getElapsedTime();
			uniforms.theme.value +=
				(resolveTheme(themeRef.current) - uniforms.theme.value) * 0.06;
			uniforms.intensity.value +=
				(THREE.MathUtils.clamp(intensityRef.current, 0, 1) -
					uniforms.intensity.value) *
				0.1;
			renderer.render(scene, camera);

			// Probe the centre pixel ~12×/s for an honest luminance reading.
			const probe = sampleRef.current;
			if (probe) {
				const now = uniforms.iTime.value;
				if (now - lastSample > 0.08) {
					lastSample = now;
					const gl = renderer.getContext();
					const size = renderer.getDrawingBufferSize(new THREE.Vector2());
					gl.readPixels(
						Math.floor(size.x / 2),
						Math.floor(size.y / 2),
						1,
						1,
						gl.RGBA,
						gl.UNSIGNED_BYTE,
						sampleBuffer,
					);
					const lum =
						(0.2126 * sampleBuffer[0] +
							0.7152 * sampleBuffer[1] +
							0.0722 * sampleBuffer[2]) /
						255;
					probe(lum);
				}
			}
			frameId = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener("resize", onResize);
			media.removeEventListener("change", onScheme);
			renderer.dispose();
			geometry.dispose();
			material.dispose();
			if (container && renderer.domElement.parentNode === container) {
				container.removeChild(renderer.domElement);
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={className ?? "shader-container"}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: -1,
				pointerEvents: "none",
			}}
			aria-label="Molten Core animated background"
		/>
	);
};

export default MoltenCoreShader;
