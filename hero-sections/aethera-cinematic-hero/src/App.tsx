import VideoBackground from "./components/VideoBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background">
			<VideoBackground />
			<Navbar />
			<Hero />
		</div>
	);
}
