export function Background() {
	return (
		<div className="fixed inset-0 z-0 pointer-events-none">
			<div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] to-black" />
			<div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-star-1" />
			<div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-star-2" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px]" />
			<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]" />
		</div>
	);
}
