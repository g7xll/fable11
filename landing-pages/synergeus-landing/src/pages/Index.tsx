import Hero from "../components/Hero";
import Analytics from "../components/Analytics";
import AIIntelligence from "../components/AIIntelligence";

export default function Index() {
	return (
		<main style={{ background: "#000" }}>
			<Hero />
			<Analytics />
			<AIIntelligence />
		</main>
	);
}
