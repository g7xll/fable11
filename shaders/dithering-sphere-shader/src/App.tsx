import { useState } from "react";

import { Anatomy } from "@/components/Anatomy";
import { ControlDeck } from "@/components/ControlDeck";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Install } from "@/components/Install";
import { MatrixPanel } from "@/components/MatrixPanel";
import { Nav } from "@/components/Nav";
import { ShapeGallery } from "@/components/ShapeGallery";
import { useFrameClock } from "@/hooks/useFrameClock";
import { DEFAULT_PARAMS, type Params } from "@/lib/dithering";

export default function App() {
	// One params object drives the hero, the deck preview, the matrix panel and
	// every gallery tile — tuning any control repaints them all on the next frame.
	const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
	const telemetry = useFrameClock();

	return (
		<div className="relative">
			<Nav />
			<main>
				<Hero params={params} telemetry={telemetry} />
				<ControlDeck params={params} onChange={setParams} />
				<MatrixPanel params={params} />
				<ShapeGallery
					params={params}
					onSelect={(shape) => setParams((p) => ({ ...p, shape }))}
				/>
				<Anatomy />
				<Install />
			</main>
			<Footer />
		</div>
	);
}
