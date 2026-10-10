import { useEffect, useState } from "react";

/**
 * Tracks the `prefers-reduced-motion` media query, live.
 *
 * Live rather than read-once: the setting can change mid-session, and a
 * component that only sampled it at mount would keep animating.
 *
 * The convention across this site is to collapse to an instant state rather
 * than a shortened animation — the point of the override is to remove motion,
 * not to hurry it. CSS transitions are already neutralised globally in
 * index.css, so this hook is for motion driven from JavaScript.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return reduced;
}
