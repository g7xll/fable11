import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref + a boolean that flips true once the element first scrolls into
 * view (with a generous root margin). Used to defer mounting the gallery's live
 * WebGL portraits until they're approached — so the top of the page stays cheap
 * (only the hero + console hold GL contexts) and lays out instantly, while the
 * portraits still animate by the time they're on screen. Once true, it stays
 * true (mount once, never tear down).
 */
export function useInView<T extends HTMLElement>(
	rootMargin = "300px",
): [React.RefObject<T | null>, boolean] {
	const ref = useRef<T>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || inView) return;
		if (typeof IntersectionObserver === "undefined") {
			setInView(true); // no IO support → just mount
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setInView(true);
					io.disconnect();
				}
			},
			{ rootMargin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [inView, rootMargin]);

	return [ref, inView];
}
