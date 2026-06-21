/**
 * The crystallography goniometer reticle that frames the specimen hero — two
 * counter-rotating rings with degree ticks and a hexagonal crystal-axis cage,
 * borrowed from the gear an actual mineralogist uses to measure crystal faces.
 * Purely atmospheric: it sits behind the title and ignores pointer events.
 */
export function Goniometer() {
	const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

	return (
		<div
			aria-hidden
			className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2"
		>
			<svg viewBox="0 0 200 200" className="h-full w-full opacity-[0.55]">
				{/* Outer graduated ring */}
				<g className="origin-center animate-goniometer-spin">
					<circle
						cx="100"
						cy="100"
						r="94"
						fill="none"
						stroke="rgba(103, 200, 240, 0.22)"
						strokeWidth="0.4"
					/>
					{ticks.map((deg) => {
						const major = deg % 30 === 0;
						const a = (deg * Math.PI) / 180;
						const r1 = 94;
						const r2 = major ? 88 : 91;
						return (
							<line
								key={deg}
								x1={100 + r1 * Math.cos(a)}
								y1={100 + r1 * Math.sin(a)}
								x2={100 + r2 * Math.cos(a)}
								y2={100 + r2 * Math.sin(a)}
								stroke={
									major ? "rgba(82, 224, 207, 0.6)" : "rgba(144, 188, 216, 0.4)"
								}
								strokeWidth={major ? 0.8 : 0.4}
							/>
						);
					})}
				</g>

				{/* Inner counter-rotating ring */}
				<g className="origin-center animate-goniometer-spin-rev">
					<circle
						cx="100"
						cy="100"
						r="74"
						fill="none"
						stroke="rgba(154, 123, 240, 0.25)"
						strokeWidth="0.4"
						strokeDasharray="1.5 5"
					/>
					{[0, 60, 120, 180, 240, 300].map((deg) => {
						const a = (deg * Math.PI) / 180;
						return (
							<line
								key={deg}
								x1="100"
								y1="100"
								x2={100 + 74 * Math.cos(a)}
								y2={100 + 74 * Math.sin(a)}
								stroke="rgba(154, 123, 240, 0.16)"
								strokeWidth="0.35"
							/>
						);
					})}
				</g>

				{/* Static hexagonal crystal-axis cage */}
				<polygon
					points={Array.from({ length: 6 }, (_, i) => {
						const a = ((i * 60 - 90) * Math.PI) / 180;
						return `${100 + 60 * Math.cos(a)},${100 + 60 * Math.sin(a)}`;
					}).join(" ")}
					fill="none"
					stroke="rgba(103, 200, 240, 0.28)"
					strokeWidth="0.5"
				/>

				{/* Crosshair */}
				<line
					x1="100"
					y1="40"
					x2="100"
					y2="48"
					stroke="rgba(82,224,207,0.7)"
					strokeWidth="0.6"
				/>
				<line
					x1="100"
					y1="152"
					x2="100"
					y2="160"
					stroke="rgba(82,224,207,0.7)"
					strokeWidth="0.6"
				/>
				<line
					x1="40"
					y1="100"
					x2="48"
					y2="100"
					stroke="rgba(82,224,207,0.7)"
					strokeWidth="0.6"
				/>
				<line
					x1="152"
					y1="100"
					x2="160"
					y2="100"
					stroke="rgba(82,224,207,0.7)"
					strokeWidth="0.6"
				/>
			</svg>
		</div>
	);
}
