import { useCallback, useState } from "react";

import { Anatomy } from "@/components/Anatomy";
import { ControlDeck } from "@/components/ControlDeck";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Instrument } from "@/components/Instrument";
import { Integrate } from "@/components/Integrate";
import { Nav } from "@/components/Nav";
import GridShader, {
	DEFAULT_GRID_PARAMS,
	type GridParams,
	type GridTelemetry,
} from "@/components/ui/grid-shader";

const INITIAL_TELEMETRY: GridTelemetry = {
	time: 0,
	fps: 0,
	width: 0,
	height: 0,
	frame: 0,
	mouse: [0, 0, 0, 0],
};

/**
 * GRIDLINE — a component-library showcase for the brief's WebGL2 ASCII-grid
 * shader. A single set of params feeds the fixed, full-page background and the
 * control deck's contained preview, while the live context streams telemetry up
 * into the hero + instrument HUDs.
 */
export default function App() {
	const [params, setParams] = useState<GridParams>(DEFAULT_GRID_PARAMS);
	const [telemetry, setTelemetry] = useState<GridTelemetry>(INITIAL_TELEMETRY);

	const handleReset = useCallback(() => setParams(DEFAULT_GRID_PARAMS), []);

	return (
		<>
			{/* The shader IS the page background — one fixed, drifting field. */}
			<GridShader fixed params={params} onTelemetry={setTelemetry} />

			<Nav />

			<main className="relative">
				<Hero telemetry={telemetry} />
				<Instrument telemetry={telemetry} />
				<ControlDeck
					params={params}
					onChange={setParams}
					onReset={handleReset}
				/>
				<Anatomy />
				<Integrate />
			</main>

			<Footer />
		</>
	);
}
