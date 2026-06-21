import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import HeroNavbar from "@/components/HeroNavbar";
import HeroShader from "@/components/HeroShader";
import PromptInput from "@/components/PromptInput";
import SectionTrustedBy from "@/components/SectionTrustedBy";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<div className="relative w-full bg-black text-white">
			<HeroNavbar />
			<div
				className="relative w-full overflow-hidden"
				style={{ height: "100vh" }}
			>
				<HeroShader />
				<div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
					<div
						className="pointer-events-auto w-full flex flex-col items-center"
						style={{ fontFamily: '"Inter Tight", sans-serif' }}
					>
						<a
							href="#"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 12,
								padding: "6px 16px 6px 6px",
								borderRadius: 999,
								background: "rgba(15,15,15,0.6)",
								border: "1px solid rgba(255,255,255,0.08)",
								backdropFilter: "blur(18px)",
								WebkitBackdropFilter: "blur(18px)",
								color: "#fff",
								fontSize: 14,
								textDecoration: "none",
								marginBottom: 28,
							}}
						>
							<span
								style={{
									background: "#2F6BFF",
									color: "#fff",
									fontSize: 12,
									fontWeight: 500,
									padding: "4px 10px",
									borderRadius: 999,
								}}
							>
								New
							</span>
							<span style={{ color: "rgba(255,255,255,0.92)" }}>
								Better SEO – Apps built to be found
							</span>
							<ArrowRight size={16} color="rgba(255,255,255,0.85)" />
						</a>
						<h1
							style={{
								fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
								fontWeight: 600,
								letterSpacing: "-0.03em",
								lineHeight: 1.15,
								paddingBottom: "0.15em",
								margin: 0,
								textAlign: "center",
							}}
							className="gradient-text-animate"
						>
							Build something Lovable
						</h1>
						<p
							style={{
								fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
								color: "rgba(255,255,255,0.65)",
								marginTop: 6,
								marginBottom: 36,
								textAlign: "center",
							}}
						>
							Create apps and websites by chatting with AI
						</p>
						<PromptInput />
					</div>
				</div>
			</div>
			<SectionTrustedBy />
		</div>
	);
}
