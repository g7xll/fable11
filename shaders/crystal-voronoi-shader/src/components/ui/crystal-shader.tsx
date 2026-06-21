import React, { useRef, useEffect } from "react";

export interface InteractiveShaderProps {
	/** How many cells in the Voronoi grid. */
	cellDensity?: number;
	/** Speed multiplier for time. */
	animationSpeed?: number;
	/** How strongly the second Voronoi field warps the first. */
	warpFactor?: number;
	/** How much the mouse repels the pattern. */
	mouseInfluence?: number;
	/**
	 * Optional probe. Fired ~12×/s with the average luminance of the rendered
	 * frame (0–1) plus the spectral RGB the shader is currently casting, so an
	 * external HUD can read the specimen's state straight off the GPU instead of
	 * re-deriving it. Additive — it never changes what's drawn.
	 */
	onSample?: (sample: {
		luminance: number;
		rgb: [number, number, number];
	}) => void;
	className?: string;
	style?: React.CSSProperties;
}

const InteractiveShader: React.FC<InteractiveShaderProps> = ({
	cellDensity = 8.0,
	animationSpeed = 0.2,
	warpFactor = 0.6,
	mouseInfluence = 0.15,
	onSample,
	className,
	style,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mousePos = useRef({ x: 0.5, y: 0.5 });

	// Keep the latest prop values in refs so the persistent render loop reads
	// them live without tearing down the WebGL context on every change.
	const cellDensityRef = useRef(cellDensity);
	const animationSpeedRef = useRef(animationSpeed);
	const warpFactorRef = useRef(warpFactor);
	const mouseInfluenceRef = useRef(mouseInfluence);
	const sampleRef = useRef(onSample);
	cellDensityRef.current = cellDensity;
	animationSpeedRef.current = animationSpeed;
	warpFactorRef.current = warpFactor;
	mouseInfluenceRef.current = mouseInfluence;
	sampleRef.current = onSample;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Get WebGL context. `preserveDrawingBuffer` lets the HUD read the rendered
		// frame back with readPixels without racing the compositor.
		const gl = canvas.getContext("webgl", {
			antialias: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			console.error("WebGL is not supported in this browser.");
			return;
		}

		// Compile a shader of given type.
		function compileShader(src: string, type: number) {
			const s = gl!.createShader(type);
			if (!s) return null;
			gl!.shaderSource(s, src);
			gl!.compileShader(s);

			if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
				console.error("Shader compile error:", gl!.getShaderInfoLog(s));
				gl!.deleteShader(s);
				return null;
			}
			return s;
		}

		// Vertex shader (fullscreen quad).
		const vertexShaderSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

		// Fragment shader (Voronoi + warp + color).
		const fragmentShaderSrc = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform float uCellDensity;
      uniform float uAnimationSpeed;
      uniform float uWarpFactor;
      uniform float uMouseInfluence;
      #define PI 3.14159265359

      vec2 random2(vec2 p) {
        return fract(sin(vec2(
          dot(p, vec2(127.1,311.7)),
          dot(p, vec2(269.5,183.3))
        )) * 43758.5453);
      }

      // Returns shortest and second-shortest distance in a Voronoi diagram.
      vec2 voronoi(vec2 x, float time) {
        vec2 n = floor(x);
        vec2 f = fract(x);

        float m = 10.0;
        float m2 = 10.0;

        for(int j = -1; j <= 1; j++){
          for(int i = -1; i <= 1; i++){
            vec2 g = vec2(float(i), float(j));
            vec2 o = random2(n + g);
            o = 0.5 + 0.5 * sin(time + o * PI * 2.0);
            float d = length(g - f + o);
            if (d < m) {
              m2 = m;
              m = d;
            } else if (d < m2) {
              m2 = d;
            }
          }
        }
        return vec2(m, m2);
      }

      void main() {
        // Normalized pixel coords.
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

        // Mouse in [-1..1].
        vec2 m = (iMouse * 2.0 - 1.0);
        m.y *= -1.0;

        // Repel effect.
        float md = length(uv - m);
        vec2 disp = normalize(uv - m)
          * (1.0 - smoothstep(0.0, 0.5, md))
          * uMouseInfluence;
        uv -= disp;

        float t = iTime * uAnimationSpeed;
        vec2 b = voronoi(uv * uCellDensity, t);
        vec2 w = voronoi(uv * uCellDensity + b.yy * uWarpFactor, t);

        float pattern = w.y - w.x;
        vec3 baseColor = 0.5 + 0.5 * cos(t * 0.5 + vec3(0.0, 0.2, 0.4));
        baseColor *= 1.0 - smoothstep(0.01, 0.02, pattern);
        baseColor += pow(1.0 - b.x, 10.0) * 0.1;

        gl_FragColor = vec4(baseColor, 1.0);
      }
    `;

		// Compile & link the program.
		const vShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
		const fShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
		if (!vShader || !fShader) return;

		const program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, vShader);
		gl.attachShader(program, fShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("Program link error:", gl.getProgramInfoLog(program));
			return;
		}
		gl.useProgram(program);

		// Look up attribute/uniform locations BEFORE the first resize, so the
		// resize helper can safely push iResolution into the active program.
		const aPosLoc = gl.getAttribLocation(program, "aPosition");
		gl.enableVertexAttribArray(aPosLoc);

		const iResolutionLoc = gl.getUniformLocation(program, "iResolution");
		const iTimeLoc = gl.getUniformLocation(program, "iTime");
		const iMouseLoc = gl.getUniformLocation(program, "iMouse");
		const uCellDensityLoc = gl.getUniformLocation(program, "uCellDensity");
		const uAnimationSpeedLoc = gl.getUniformLocation(
			program,
			"uAnimationSpeed",
		);
		const uWarpFactorLoc = gl.getUniformLocation(program, "uWarpFactor");
		const uMouseInfluenceLoc = gl.getUniformLocation(
			program,
			"uMouseInfluence",
		);

		// Full-screen quad (two triangles).
		const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
		gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

		gl.clearColor(0, 0, 0, 1);

		// Full-viewport resize helper. Defined after the program/uniforms exist.
		function resizeCanvas() {
			const c = canvas!;
			const width = window.innerWidth;
			const height = window.innerHeight;

			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			c.width = Math.floor(width * dpr);
			c.height = Math.floor(height * dpr);
			c.style.width = `${width}px`;
			c.style.height = `${height}px`;

			gl!.viewport(0, 0, c.width, c.height);
			gl!.uniform2f(iResolutionLoc, c.width, c.height);
		}

		// Mouse-tracking helper.
		function handleMouseMove(e: MouseEvent) {
			const rect = canvas!.getBoundingClientRect();
			mousePos.current = {
				x: (e.clientX - rect.left) / rect.width,
				y: (e.clientY - rect.top) / rect.height,
			};
		}

		const start = performance.now();
		let rafId = 0;
		let lastSample = 0;
		const px = new Uint8Array(4);

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("resize", resizeCanvas);
		resizeCanvas();

		// Main render loop.
		function render() {
			gl!.clear(gl!.COLOR_BUFFER_BIT);

			const now = (performance.now() - start) / 1000;
			gl!.uniform1f(iTimeLoc, now);
			gl!.uniform2f(iMouseLoc, mousePos.current.x, mousePos.current.y);
			gl!.uniform1f(uCellDensityLoc, cellDensityRef.current);
			gl!.uniform1f(uAnimationSpeedLoc, animationSpeedRef.current);
			gl!.uniform1f(uWarpFactorLoc, warpFactorRef.current);
			gl!.uniform1f(uMouseInfluenceLoc, mouseInfluenceRef.current);

			gl!.drawArrays(gl!.TRIANGLES, 0, 6);

			// Probe the centre pixel ~12×/s for an honest read of the specimen.
			const probe = sampleRef.current;
			if (probe && now - lastSample > 0.08) {
				lastSample = now;
				gl!.readPixels(
					(canvas!.width / 2) | 0,
					(canvas!.height / 2) | 0,
					1,
					1,
					gl!.RGBA,
					gl!.UNSIGNED_BYTE,
					px,
				);
				const r = px[0] / 255;
				const g = px[1] / 255;
				const b = px[2] / 255;
				probe({
					luminance: 0.2126 * r + 0.7152 * g + 0.0722 * b,
					rgb: [r, g, b],
				});
			}

			rafId = requestAnimationFrame(render);
		}
		render();

		// Cleanup on unmount.
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("resize", resizeCanvas);
			if (!gl.isContextLost()) {
				gl.deleteShader(vShader);
				gl.deleteShader(fShader);
				gl.deleteProgram(program);
				gl.deleteBuffer(buf);
			}
		};
		// The loop reads live props through refs, so this effect runs once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Make the canvas fill the viewport.
	return (
		<canvas
			ref={canvasRef}
			className={className}
			aria-label="Crystal Synthesis animated Voronoi background"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				display: "block",
				zIndex: 0,
				...style,
			}}
		/>
	);
};

export default InteractiveShader;
