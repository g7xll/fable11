import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll: returns a ref + a `shown` flag that flips true once the
 * element scrolls into view. Honors `prefers-reduced-motion` by showing
 * immediately. Disconnects after the first reveal so it never re-runs.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T | null>(null);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const reduce =
			typeof window !== "undefined" &&
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		if (reduce) {
			setShown(true);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setShown(true);
						io.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return { ref, shown };
}
