import { useEffect, useRef, useState } from "react";

/**
 * Mount-gating helper. Each live WebGL2 canvas holds its own GL context, and
 * browsers cap how many can exist at once, so we only render a shader while it
 * is near the viewport. `once` keeps it mounted after the first reveal (used for
 * scroll-in entrances); otherwise it tracks visibility both ways.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = "200px",
  once = false
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, inView] as const;
}
