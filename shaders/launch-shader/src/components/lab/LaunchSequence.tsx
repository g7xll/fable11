import { useEffect, useState } from "react";

/**
 * LaunchSequence — a right-edge ignition checklist that arms one step at a time
 * once `ignited` goes true, landing on LIFTOFF. Purely presentational: it dresses
 * the shader's start-up as a flight-control sequence and has no effect on the GPU
 * pass. When `ignited` is false (e.g. the engines are held) the rail disarms.
 */
const STEPS = [
	"GUIDANCE INTERNAL",
	"PROPELLANT PRESS",
	"IGNITER FIRE",
	"MAINSTAGE START",
	"THRUST NOMINAL",
	"LIFTOFF",
] as const;

export function LaunchSequence({ ignited }: { ignited: boolean }) {
	const [armed, setArmed] = useState(0);

	useEffect(() => {
		if (!ignited) {
			setArmed(0);
			return;
		}
		let i = 0;
		setArmed(1);
		const id = window.setInterval(() => {
			i += 1;
			setArmed(i + 1);
			if (i + 1 >= STEPS.length) window.clearInterval(id);
		}, 650);
		return () => window.clearInterval(id);
	}, [ignited]);

	return (
		<div className="animate-rail-in pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-48 flex-col justify-center pr-6 lg:flex">
			<span className="tele mb-4 text-white/35">LAUNCH SEQUENCE</span>
			<ol className="flex flex-col gap-3">
				{STEPS.map((label, i) => {
					const on = i < armed;
					const isLast = i === STEPS.length - 1;
					const live = on && isLast && armed >= STEPS.length;
					return (
						<li key={label} className="flex items-center gap-2.5">
							<span
								className="relative flex h-2 w-2 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
								style={{
									background: on
										? isLast
											? "hsl(var(--flare-core))"
											: "hsl(var(--flare-ember))"
										: "rgba(255,255,255,0.14)",
									boxShadow: on
										? `0 0 8px hsl(var(--flare-ember) / 0.8)`
										: "none",
								}}
							>
								{live && (
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--flare-core))] opacity-70" />
								)}
							</span>
							<span
								className="tele transition-colors duration-300"
								style={{
									color: on
										? isLast
											? "hsl(var(--flare-core))"
											: "rgba(255,255,255,0.78)"
										: "rgba(255,255,255,0.28)",
								}}
							>
								{label}
							</span>
						</li>
					);
				})}
			</ol>
		</div>
	);
}
