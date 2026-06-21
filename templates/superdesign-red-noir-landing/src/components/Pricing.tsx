import { Check } from "lucide-react";

type Tier = {
	name: string;
	desc: string;
	price: string;
	features: string[];
	cta: string;
	featured?: boolean;
};

const TIERS: Tier[] = [
	{
		name: "Starter",
		desc: "For individuals exploring AI design possibilities.",
		price: "0",
		features: ["1 Project", "Basic AI Generation", "Community Support"],
		cta: "Get Started",
	},
	{
		name: "Pro",
		desc: "For professional designers and high-growth freelancers.",
		price: "49",
		features: [
			"Unlimited Projects",
			"Advanced AI Models",
			"Direct Code Export",
			"Priority Support",
		],
		cta: "Go Pro",
		featured: true,
	},
	{
		name: "Team",
		desc: "For scale-up design teams and creative agencies.",
		price: "199",
		features: [
			"Team Collaboration",
			"Custom Design Systems",
			"API Access & SSO",
		],
		cta: "Contact Sales",
	},
];

export function Pricing() {
	return (
		<section className="py-32 px-6 bg-black relative border-t border-white/5">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-20">
					<h2 className="text-4xl md:text-5xl font-semibold text-white font-manrope mb-4">
						Simple, Transparent Pricing
					</h2>
					<p className="text-zinc-400">Start for free, scale as you grow.</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{TIERS.map((t) => (
						<div
							key={t.name}
							className={
								t.featured
									? "relative p-8 border border-[#ef233c] bg-zinc-900/40 shadow-[0_0_30px_rgba(239,35,60,0.1)] rounded-xl flex flex-col scale-105 z-10"
									: "p-8 border border-zinc-800 bg-black hover:border-zinc-700 transition-all rounded-xl flex flex-col"
							}
						>
							{t.featured && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ef233c] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
									Recommended
								</div>
							)}
							<h3 className="text-xl font-bold font-manrope mb-2">{t.name}</h3>
							<p
								className={`${t.featured ? "text-zinc-400" : "text-zinc-500"} text-sm mb-8 h-10`}
							>
								{t.desc}
							</p>
							<div className="mb-8 flex items-baseline gap-1">
								<span className="text-zinc-500">$</span>
								<span className="text-5xl font-bold text-white">{t.price}</span>
								<span className="text-zinc-500 text-sm">/mo</span>
							</div>
							<ul className="space-y-4 mb-8 flex-1">
								{t.features.map((f) => (
									<li
										key={f}
										className="flex items-center gap-3 text-sm text-zinc-300"
									>
										<Check className="w-4 h-4 shrink-0 text-[#ef233c]" /> {f}
									</li>
								))}
							</ul>
							<button
								className={
									t.featured
										? "w-full py-3 px-4 bg-[#ef233c] hover:bg-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
										: "w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
								}
							>
								{t.cta}
							</button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
