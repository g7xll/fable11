"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Custom shader material for advanced effects
const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec2 uv = vUv;

    // Create animated noise pattern
    float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
    noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;

    // Mix colors based on noise and position
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);

    // Add glow effect
    float glow = 1.0 - length(uv - 0.5) * 2.0;
    glow = pow(glow, 2.0);

    gl_FragColor = vec4(color * glow, glow * 0.8);
  }
`;

export function ShaderPlane({
	position,
	color1 = "#ff5722",
	color2 = "#ffffff",
	speed = 1,
	intensity = 1,
}: {
	position: [number, number, number];
	color1?: string;
	color2?: string;
	speed?: number;
	intensity?: number;
}) {
	const mesh = useRef<THREE.Mesh>(null);

	const uniforms = useMemo(
		() => ({
			time: { value: 0 },
			intensity: { value: 1.0 },
			color1: { value: new THREE.Color(color1) },
			color2: { value: new THREE.Color(color2) },
		}),
		[color1, color2],
	);

	useFrame((state) => {
		if (mesh.current) {
			const t = state.clock.elapsedTime * speed;
			uniforms.time.value = t;
			uniforms.intensity.value = (1.0 + Math.sin(t * 2) * 0.3) * intensity;
		}
	});

	return (
		<mesh ref={mesh} position={position}>
			<planeGeometry args={[2, 2, 32, 32]} />
			<shaderMaterial
				uniforms={uniforms}
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
				transparent
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

export function EnergyRing({
	radius = 1,
	position = [0, 0, 0],
	speed = 1,
	color = "#ff5722",
}: {
	radius?: number;
	position?: [number, number, number];
	speed?: number;
	color?: string;
}) {
	const mesh = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (mesh.current) {
			const t = state.clock.elapsedTime * speed;
			mesh.current.rotation.z = t;
			const mat = mesh.current.material as THREE.MeshBasicMaterial;
			mat.opacity = 0.5 + Math.sin(t * 3) * 0.3;
		}
	});

	return (
		<mesh ref={mesh} position={position}>
			<ringGeometry args={[radius * 0.8, radius, 32]} />
			<meshBasicMaterial
				color={color}
				transparent
				opacity={0.6}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

/**
 * BackgroundPaperShaders — a self-contained react-three-fiber canvas that
 * composes the custom ShaderPlane meshes with orbiting EnergyRings. Drop it
 * behind any UI as a living background, or use it as one selectable channel in
 * a shader playground. Every parameter is driven live from props.
 */
export function BackgroundPaperShaders({
	className,
	color1 = "#ff5722",
	color2 = "#ffffff",
	speed = 1,
	intensity = 1,
}: {
	className?: string;
	color1?: string;
	color2?: string;
	speed?: number;
	intensity?: number;
}) {
	return (
		<Canvas
			className={className}
			camera={{ position: [0, 0, 4], fov: 60 }}
			gl={{ antialias: true, alpha: true }}
			dpr={[1, 2]}
		>
			<ambientLight intensity={0.5} />
			<ShaderPlane
				position={[-1.1, 0.4, 0]}
				color1={color1}
				color2={color2}
				speed={speed}
				intensity={intensity}
			/>
			<ShaderPlane
				position={[1.1, -0.4, -0.4]}
				color1={color2}
				color2={color1}
				speed={speed * 0.8}
				intensity={intensity}
			/>
			<ShaderPlane
				position={[0, 0, -1]}
				color1={color1}
				color2="#1a1a1a"
				speed={speed * 1.2}
				intensity={intensity * 0.7}
			/>
			<EnergyRing
				radius={1.4}
				position={[-1.1, 0.4, 0.3]}
				speed={speed}
				color={color1}
			/>
			<EnergyRing
				radius={1.0}
				position={[1.1, -0.4, 0]}
				speed={speed * 1.3}
				color={color1}
			/>
			<EnergyRing
				radius={1.8}
				position={[0, 0, -0.6]}
				speed={speed * 0.6}
				color={color2}
			/>
		</Canvas>
	);
}
