import { createFileRoute } from "@tanstack/react-router";
import { Background } from "~/components/Background";
import { Navbar } from "~/components/Navbar";
import { Hero } from "~/components/Hero";
import { Features } from "~/components/Features";
import { Testimonial } from "~/components/Testimonial";
import { Pricing } from "~/components/Pricing";
import { Waitlist } from "~/components/Waitlist";
import { Footer } from "~/components/Footer";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="min-h-screen bg-black text-white font-inter relative overflow-x-hidden selection-red">
			<Background />
			<div className="gradient-blur" />
			<Navbar />
			<main className="relative z-10">
				<Hero />
				<Features />
				<Testimonial />
				<Pricing />
				<Waitlist />
			</main>
			<Footer />
		</div>
	);
}
