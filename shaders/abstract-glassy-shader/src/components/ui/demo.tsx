import { ShaderComponent } from "@/components/ui/abstract-glassy-shader";

// The component renders a bare <canvas>, so it inherits the size of its parent.
// Give it a full-viewport, black-backed box to fill — the minimal drop-in demo.
export default function DemoOne() {
	return (
		<div className="w-full h-screen bg-black">
			<ShaderComponent />
		</div>
	);
}

export { DemoOne };
