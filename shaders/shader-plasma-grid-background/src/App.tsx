import { useCallback, useState } from "react";

import { Anatomy } from "@/components/Anatomy";
import { ControlDeck } from "@/components/ControlDeck";
import { Field } from "@/components/Field";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Install } from "@/components/Install";
import { Nav } from "@/components/Nav";
import ShaderBackgroundPro, {
	DEFAULT_PARAMS,
	type ShaderParams,
	type ShaderTelemetry,
} from "@/components/ui/shader-background-pro";

const INITIAL_TELEMETRY: ShaderTelemetry = {
	time: 0,
	fps: 60,
	width: 0,
	height: 0,
};

export default function App() {
	// One params object drives BOTH the page-wide background and the deck preview,
	// so tuning a fader recolours the entire page live.
	const [params, setParams] = useState<ShaderParams>(DEFAULT_PARAMS);
	const [telemetry, setTelemetry] = useState<ShaderTelemetry>(INITIAL_TELEMETRY);

	const handleTelemetry = useCallback((t: ShaderTelemetry) => {
		setTelemetry(t);
	}, []);

	return (
		<div className="relative min-h-screen">
			{/* The brief's component, parameterised — this is the live background. */}
			<ShaderBackgroundPro
				params={params}
				onTelemetry={handleTelemetry}
				fixed
			/>
			{/* Legibility veil so text stays readable over the bright field. */}
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_8%,rgba(5,5,16,0.35),rgba(5,5,16,0.82)_70%)]"
			/>

			<Nav />

			<main>
				<Hero telemetry={telemetry} />
				<ControlDeck
					params={params}
					onChange={setParams}
					onReset={() => setParams(DEFAULT_PARAMS)}
				/>
				<Anatomy />
				<Install />
				<Field />
			</main>

			<Footer />
		</div>
	);
}
