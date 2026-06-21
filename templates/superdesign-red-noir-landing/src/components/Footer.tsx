const PLATFORM = ["Features", "Integrations", "Pricing", "Docs"];
const COMPANY = ["About Us", "Careers", "Blog", "Legal"];

export function Footer() {
	return (
		<footer className="bg-black border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden">
			<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-24 relative z-10">
				<div className="md:col-span-2">
					<div className="flex items-center gap-2 mb-6">
						<div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45" />
						<span className="text-2xl font-bold font-manrope tracking-tight">
							Superdesign
						</span>
					</div>
					<p className="text-zinc-500 max-w-xs leading-relaxed">
						Pioneering the future of digital product design with artificial
						intelligence and human-centered design principles.
					</p>
				</div>
				<div>
					<h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6">
						Platform
					</h4>
					<ul className="space-y-4 text-zinc-400 text-sm">
						{PLATFORM.map((l) => (
							<li key={l}>
								<a href="#" className="hover:text-white transition-colors">
									{l}
								</a>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6">
						Company
					</h4>
					<ul className="space-y-4 text-zinc-400 text-sm">
						{COMPANY.map((l) => (
							<li key={l}>
								<a href="#" className="hover:text-white transition-colors">
									{l}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex justify-center items-center py-10 opacity-20 pointer-events-none">
				<h1 className="text-[15vw] leading-none font-bold font-manrope tracking-tighter text-stroke select-none">
					SUPERDESIGN
				</h1>
			</div>
			<div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest">
				<p>&copy; 2024 Superdesign AI Inc. All rights reserved.</p>
				<div className="flex gap-6 mt-4 md:mt-0">
					<a href="#" className="hover:text-zinc-400">
						Twitter
					</a>
					<a href="#" className="hover:text-zinc-400">
						LinkedIn
					</a>
					<a href="#" className="hover:text-zinc-400">
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
