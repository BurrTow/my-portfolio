import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Subtle animated diagonal stripes behind the UI. Pure CSS transform
 * animation (no JS rAF loop) to keep it cheap; disabled entirely under
 * prefers-reduced-motion.
 */
export function BackgroundFX() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-p3-black"
    >
      <div
        className={`absolute inset-0 -skew-y-12 opacity-[0.07] ${
          reducedMotion ? "" : "animate-stripe-drift"
        }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #2B6FFF 0px, #2B6FFF 2px, transparent 2px, transparent 48px)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
