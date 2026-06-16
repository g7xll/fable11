import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<Navbar />
			<Hero />
		</div>
	);
}
