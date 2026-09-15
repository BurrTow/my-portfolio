import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Subtle drifting diagonal stripes behind the UI.
 *
 * The drift is a transform, not an animated `background-position`: the latter
 * is not GPU-composited, so a full-viewport element repaints every frame and
 * costs about two thirds of the frame budget at desktop size. The skew lives
 * on a wrapper rather than the animated element, because a CSS animation that
 * sets `transform` replaces the whole property and would drop a skew applied
 * alongside it.
 *
 * Travel is one tile pair (96px against a 48px repeat), so the loop is
 * seamless regardless of viewport width.
 */
export function BackgroundFX() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-p3-black"
    >
      <div className="absolute inset-0 -skew-y-12 opacity-[0.07]">
        <div
          className={`absolute inset-y-0 left-0 w-[calc(100%+96px)] ${
            reducedMotion ? "" : "animate-stripe-drift"
          }`}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #2B6FFF 0px, #2B6FFF 2px, transparent 2px, transparent 48px)",
          }}
        />
      </div>
    </div>
  );
}
