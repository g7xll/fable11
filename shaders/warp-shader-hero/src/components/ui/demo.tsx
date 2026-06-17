import WarpShaderHero from "@/components/ui/wrap-shader";

/**
 * DemoOne — the prompt's example usage. The original snippet had a few JSX
 * typos (a malformed `className= "..."` and a broken `< /div>` closing tag) that
 * would not compile; this is the same component, same wrapper, corrected so the
 * project type-checks and renders. It is exercised by `<DemoStage />`.
 */
export default function DemoOne() {
	return (
		<div className="min-h-screen h-full w-full">
			<WarpShaderHero />
		</div>
	);
}
