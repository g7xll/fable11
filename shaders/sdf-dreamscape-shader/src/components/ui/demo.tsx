// The brief's demo entry, kept verbatim. This renders the original
// self-contained SDF Dreamscape widget. The app's own console (src/App.tsx)
// wraps the same shader primitive in a richer "dream recorder" UI, but this
// file is preserved so the integration matches the prompt exactly.
import ShaderComponent from "@/components/ui/sdf-dreamscape";

export default function DemoOne() {
	return <ShaderComponent />;
}
