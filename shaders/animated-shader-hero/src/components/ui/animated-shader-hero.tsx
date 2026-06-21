import type React from "react";
import { useEffect, useRef } from "react";

/**
 * animated-shader-hero.tsx
 *
 * A reusable, self-contained WebGL2 hero. The fragment shader is by
 * Matthias Hurrle (@atzedent) and renders a drifting fractal ember field that
 * also reacts to pointer movement. The component is driven entirely by props,
 * so it can be dropped into any shadcn / Tailwind / TypeScript project.
 *
 * Note vs. the original snippet: the keyframes/utilities that were declared with
 * a Next.js-only `<style jsx>` block now live in the global stylesheet
 * (src/index.css) so the same classNames work in a plain Vite + Tailwind app.
 * The `onFrame` prop is an additive, optional hook used by the showcase to read
 * live uniform values for the on-screen HUD — it does not change default
 * behavior when omitted.
 */

// Types for component props
interface HeroProps {
	trustBadge?: {
		text: string;
		icons?: string[];
	};
	headline: {
		line1: string;
		line2: string;
	};
	subtitle: string;
	buttons?: {
		primary?: {
			text: string;
			onClick?: () => void;
		};
		secondary?: {
			text: string;
			onClick?: () => void;
		};
	};
	/** Optional live telemetry callback, invoked once per rendered frame. */
	onFrame?: (state: {
		time: number;
		width: number;
		height: number;
		pointerCount: number;
		fps: number;
	}) => void;
	className?: string;
}

// Reusable Shader Background Hook
const useShaderBackground = (onFrame?: HeroProps["onFrame"]) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number>();
	const rendererRef = useRef<WebGLRenderer | null>(null);
	const pointersRef = useRef<PointerHandler | null>(null);

	// WebGL Renderer class
	class WebGLRenderer {
		private canvas: HTMLCanvasElement;
		private gl: WebGL2RenderingContext;
		private program: WebGLProgram | null = null;
		private vs: WebGLShader | null = null;
		private fs: WebGLShader | null = null;
		private buffer: WebGLBuffer | null = null;
		private scale: number;
		private shaderSource: string;
		private mouseMove = [0, 0];
		private mouseCoords = [0, 0];
		private pointerCoords = [0, 0];
		private nbrOfPointers = 0;

		private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

		private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

		constructor(canvas: HTMLCanvasElement, scale: number) {
			this.canvas = canvas;
			this.scale = scale;
			this.gl = canvas.getContext("webgl2")!;
			this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
			this.shaderSource = defaultShaderSource;
		}

		updateShader(source: string) {
			this.reset();
			this.shaderSource = source;
			this.setup();
			this.init();
		}

		updateMove(deltas: number[]) {
			this.mouseMove = deltas;
		}

		updateMouse(coords: number[]) {
			this.mouseCoords = coords;
		}

		updatePointerCoords(coords: number[]) {
			this.pointerCoords = coords;
		}

		updatePointerCount(nbr: number) {
			this.nbrOfPointers = nbr;
		}

		updateScale(scale: number) {
			this.scale = scale;
			this.gl.viewport(
				0,
				0,
				this.canvas.width * this.scale,
				this.canvas.height * this.scale,
			);
		}

		compile(shader: WebGLShader, source: string) {
			const gl = this.gl;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				const error = gl.getShaderInfoLog(shader);
				console.error("Shader compilation error:", error);
			}
		}

		test(source: string) {
			let result = null;
			const gl = this.gl;
			const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				result = gl.getShaderInfoLog(shader);
			}
			gl.deleteShader(shader);
			return result;
		}

		reset() {
			const gl = this.gl;
			if (
				this.program &&
				!gl.getProgramParameter(this.program, gl.DELETE_STATUS)
			) {
				if (this.vs) {
					gl.detachShader(this.program, this.vs);
					gl.deleteShader(this.vs);
				}
				if (this.fs) {
					gl.detachShader(this.program, this.fs);
					gl.deleteShader(this.fs);
				}
				gl.deleteProgram(this.program);
			}
			if (this.buffer) {
				gl.deleteBuffer(this.buffer);
				this.buffer = null;
			}
		}

		setup() {
			const gl = this.gl;
			this.vs = gl.createShader(gl.VERTEX_SHADER)!;
			this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
			this.compile(this.vs, this.vertexSrc);
			this.compile(this.fs, this.shaderSource);
			this.program = gl.createProgram()!;
			gl.attachShader(this.program, this.vs);
			gl.attachShader(this.program, this.fs);
			gl.linkProgram(this.program);

			if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
				console.error(gl.getProgramInfoLog(this.program));
			}
		}

		init() {
			const gl = this.gl;
			const program = this.program!;

			this.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(this.vertices),
				gl.STATIC_DRAW,
			);

			const position = gl.getAttribLocation(program, "position");
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

			(program as any).resolution = gl.getUniformLocation(
				program,
				"resolution",
			);
			(program as any).time = gl.getUniformLocation(program, "time");
			(program as any).move = gl.getUniformLocation(program, "move");
			(program as any).touch = gl.getUniformLocation(program, "touch");
			(program as any).pointerCount = gl.getUniformLocation(
				program,
				"pointerCount",
			);
			(program as any).pointers = gl.getUniformLocation(program, "pointers");
		}

		render(now = 0) {
			const gl = this.gl;
			const program = this.program;

			if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

			gl.uniform2f(
				(program as any).resolution,
				this.canvas.width,
				this.canvas.height,
			);
			gl.uniform1f((program as any).time, now * 1e-3);
			gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
			gl.uniform2f(
				(program as any).touch,
				this.mouseCoords[0],
				this.mouseCoords[1],
			);
			gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
			gl.uniform2fv((program as any).pointers, this.pointerCoords);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
	}

	// Pointer Handler class
	class PointerHandler {
		private scale: number;
		private active = false;
		private pointers = new Map<number, number[]>();
		private lastCoords = [0, 0];
		private moves = [0, 0];
		private element: HTMLCanvasElement;
		// Bound handlers kept so dispose() can symmetrically detach them
		// (otherwise listeners leak, and double up under React StrictMode remounts).
		private onDown: (e: PointerEvent) => void;
		private onUp: (e: PointerEvent) => void;
		private onLeave: (e: PointerEvent) => void;
		private onMove: (e: PointerEvent) => void;

		constructor(element: HTMLCanvasElement, scale: number) {
			this.scale = scale;
			this.element = element;

			const map = (
				element: HTMLCanvasElement,
				scale: number,
				x: number,
				y: number,
			) => [x * scale, element.height - y * scale];

			this.onDown = (e) => {
				this.active = true;
				this.pointers.set(
					e.pointerId,
					map(element, this.getScale(), e.clientX, e.clientY),
				);
			};

			this.onUp = (e) => {
				if (this.count === 1) {
					this.lastCoords = this.first;
				}
				this.pointers.delete(e.pointerId);
				this.active = this.pointers.size > 0;
			};

			this.onLeave = (e) => {
				if (this.count === 1) {
					this.lastCoords = this.first;
				}
				this.pointers.delete(e.pointerId);
				this.active = this.pointers.size > 0;
			};

			this.onMove = (e) => {
				if (!this.active) return;
				this.lastCoords = [e.clientX, e.clientY];
				this.pointers.set(
					e.pointerId,
					map(element, this.getScale(), e.clientX, e.clientY),
				);
				this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
			};

			element.addEventListener("pointerdown", this.onDown);
			element.addEventListener("pointerup", this.onUp);
			element.addEventListener("pointerleave", this.onLeave);
			element.addEventListener("pointermove", this.onMove);
		}

		dispose() {
			this.element.removeEventListener("pointerdown", this.onDown);
			this.element.removeEventListener("pointerup", this.onUp);
			this.element.removeEventListener("pointerleave", this.onLeave);
			this.element.removeEventListener("pointermove", this.onMove);
		}

		getScale() {
			return this.scale;
		}

		updateScale(scale: number) {
			this.scale = scale;
		}

		get count() {
			return this.pointers.size;
		}

		get move() {
			return this.moves;
		}

		get coords() {
			return this.pointers.size > 0
				? Array.from(this.pointers.values()).flat()
				: [0, 0];
		}

		get first() {
			return this.pointers.values().next().value || this.lastCoords;
		}
	}

	const resize = () => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;

		if (rendererRef.current) {
			rendererRef.current.updateScale(dpr);
		}
	};

	// Lightweight FPS sampler so the optional onFrame telemetry can report a
	// stable rate without spamming React state on every animation frame.
	let lastTelemetry = 0;
	let frames = 0;
	let fps = 0;
	let fpsWindowStart = 0;

	const loop = (now: number) => {
		if (!rendererRef.current || !pointersRef.current) return;

		rendererRef.current.updateMouse(pointersRef.current.first);
		rendererRef.current.updatePointerCount(pointersRef.current.count);
		rendererRef.current.updatePointerCoords(pointersRef.current.coords);
		rendererRef.current.updateMove(pointersRef.current.move);
		rendererRef.current.render(now);

		frames++;
		if (now - fpsWindowStart >= 500) {
			fps = Math.round((frames * 1000) / (now - fpsWindowStart));
			frames = 0;
			fpsWindowStart = now;
		}
		if (onFrame && canvasRef.current && now - lastTelemetry >= 120) {
			lastTelemetry = now;
			onFrame({
				time: now * 1e-3,
				width: canvasRef.current.width,
				height: canvasRef.current.height,
				pointerCount: pointersRef.current.count,
				fps,
			});
		}

		animationFrameRef.current = requestAnimationFrame(loop);
	};

	useEffect(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;

		rendererRef.current = new WebGLRenderer(
			canvas,
			Math.max(1, 0.5 * window.devicePixelRatio),
		);
		pointersRef.current = new PointerHandler(
			canvas,
			Math.max(1, 0.5 * window.devicePixelRatio),
		);

		rendererRef.current.setup();
		rendererRef.current.init();

		resize();

		if (rendererRef.current.test(defaultShaderSource) === null) {
			rendererRef.current.updateShader(defaultShaderSource);
		}

		loop(0);

		window.addEventListener("resize", resize);

		return () => {
			window.removeEventListener("resize", resize);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (pointersRef.current) {
				pointersRef.current.dispose();
			}
			if (rendererRef.current) {
				rendererRef.current.reset();
			}
			// Null the refs so the rAF loop guard short-circuits if a stale frame
			// was already queued, instead of driving a torn-down renderer.
			rendererRef.current = null;
			pointersRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resize, loop]);

	return canvasRef;
};

// Reusable Hero Component
const Hero: React.FC<HeroProps> = ({
	trustBadge,
	headline,
	subtitle,
	buttons,
	onFrame,
	className = "",
}) => {
	const canvasRef = useShaderBackground(onFrame);

	return (
		<div
			className={`relative w-full h-screen overflow-hidden bg-black ${className}`}
		>
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full object-contain touch-none"
				style={{ background: "black" }}
			/>

			{/* Hero Content Overlay.
          `pointer-events-none` lets pointer drags reach the shader canvas
          underneath (so "drag to disturb the field" works); interactive
          children re-enable events with `pointer-events-auto`. */}
			<div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
				{/* Trust Badge */}
				{trustBadge && (
					<div className="mb-8 animate-fade-in-down">
						<div className="flex items-center gap-2 px-6 py-3 bg-orange-500/10 backdrop-blur-md border border-orange-300/30 rounded-full text-sm">
							{trustBadge.icons && (
								<div className="flex">
									{trustBadge.icons.map((icon, index) => (
										<span
											key={index}
											className={`text-${index === 0 ? "yellow" : index === 1 ? "orange" : "amber"}-300`}
										>
											{icon}
										</span>
									))}
								</div>
							)}
							<span className="text-orange-100">{trustBadge.text}</span>
						</div>
					</div>
				)}

				<div className="text-center space-y-6 max-w-5xl mx-auto px-4">
					{/* Main Heading with Animation */}
					<div className="space-y-2">
						<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-orange-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
							{headline.line1}
						</h1>
						<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
							{headline.line2}
						</h1>
					</div>

					{/* Subtitle with Animation */}
					<div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
						<p className="text-lg md:text-xl lg:text-2xl text-orange-100/90 font-light leading-relaxed">
							{subtitle}
						</p>
					</div>

					{/* CTA Buttons with Animation */}
					{buttons && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-800">
							{buttons.primary && (
								<button
									onClick={buttons.primary.onClick}
									className="pointer-events-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
								>
									{buttons.primary.text}
								</button>
							)}
							{buttons.secondary && (
								<button
									onClick={buttons.secondary.onClick}
									className="pointer-events-auto px-8 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-300/30 hover:border-orange-300/50 text-orange-100 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
								>
									{buttons.secondary.text}
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const defaultShaderSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*
*	To explore strange new worlds, to seek out new life
*	and new civilizations, to boldly go where no man has
*	gone before.
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
// Returns a pseudo random number for a given point (white noise)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
// Returns a pseudo random number for a given point (value noise)
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
// Returns a pseudo random number for a given point (fractal noise)
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
		float b=noise(i+p+bg*1.731);
		col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
	}
	O=vec4(col,1);
}`;

export default Hero;
