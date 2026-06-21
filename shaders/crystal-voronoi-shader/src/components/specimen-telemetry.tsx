interface SpecimenTelemetryProps {
	/** Live FPS, averaged over a short window. */
	fps: number;
	/** Seconds since the specimen station came online. */
	uptime: number;
	/** Centre-pixel luminance read straight off the GPU (0–1). */
	luminance: number;
	/** Spectral RGB the shader is currently casting (0–1 each). */
	rgb: [number, number, number];
	/** Current cell density, used to estimate the lattice cell count. */
	cellDensity: number;
}

function clock(seconds: number) {
	const s = Math.floor(seconds);
	const mm = String(Math.floor(s / 60)).padStart(2, "0");
	const ss = String(s % 60).padStart(2, "0");
	return `${mm}:${ss}`;
}

function Row({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-6 py-1.5">
			<span className="font-mono text-[9px] uppercase tracking-[0.22em] text-frost-400">
				{label}
			</span>
			<span
				className={`font-mono text-[11px] tabular-nums ${
					accent ? "text-cryo-teal" : "text-frost-50"
				}`}
			>
				{value}
			</span>
		</div>
	);
}

/**
 * The signature read-out: a "specimen station" panel whose values are not
 * decorative — every line is sampled from the live render (FPS, the GPU
 * luminance probe, the spectral cast) or derived from the active uniforms.
 */
export function SpecimenTelemetry({
	fps,
	uptime,
	luminance,
	rgb,
	cellDensity,
}: SpecimenTelemetryProps) {
	const [r, g, b] = rgb.map((c) => Math.round(c * 255));
	// The Voronoi grid is sampled across the smaller viewport dimension; the
	// visible cell count scales with density², a faithful read of the field.
	const cells = Math.round(cellDensity * cellDensity);
	const hex = `#${[r, g, b]
		.map((c) => c.toString(16).padStart(2, "0"))
		.join("")
		.toUpperCase()}`;

	return (
		<div className="w-[260px] border border-steel/45 bg-obsidian-900/72 px-4 py-3.5 backdrop-blur-md">
			<div className="mb-2.5 flex items-center justify-between border-b border-steel/40 pb-2">
				<span className="font-mono text-[9px] uppercase tracking-[0.28em] text-frost-200">
					Specimen Read-out
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 animate-ice-pulse rounded-full bg-cryo-teal" />
					<span className="font-mono text-[8px] uppercase tracking-[0.2em] text-cryo-teal">
						Live
					</span>
				</span>
			</div>

			<Row label="Render" value={`${fps.toFixed(0)} fps`} accent />
			<Row label="Stage clock" value={clock(uptime)} />
			<Row label="Lattice cells" value={`≈ ${cells}`} />
			<Row label="Core lum" value={luminance.toFixed(3)} />

			<div className="mt-2.5 flex items-center justify-between gap-3 border-t border-steel/40 pt-2.5">
				<span className="font-mono text-[9px] uppercase tracking-[0.22em] text-frost-400">
					Spectral cast
				</span>
				<span className="flex items-center gap-2">
					<span
						className="h-3.5 w-3.5 rounded-[2px] border border-frost-50/20"
						style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
					/>
					<span className="font-mono text-[10px] tabular-nums text-frost-100">
						{hex}
					</span>
				</span>
			</div>
		</div>
	);
}
