import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePerfStore } from "@/store/usePerfStore";
import { useUIStore } from "@/store/useUIStore";

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
  const backgroundFx = usePerfStore((s) => s.backgroundFx);
  // The map overlay is opaque, so this is invisible while it is open —
  // animating it there costs frames for nothing anyone can see.
  const mapOpen = useUIStore((s) => s.mapOpen);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-p3-black"
    >
      {/* The blue side of the split, static. In dark its gradient stops are the
          page colour, so it paints nothing new.
          xl and up: a panel on the right, --blue-width wide at the top. Below
          xl the content column reaches far enough right that heading text
          would land on the blue, so it shrinks to a corner behind the toggle
          and Map button. Cards may overlap either; they are opaque. */}
      <div className="split-blue absolute inset-y-0 right-0 hidden w-[var(--blue-width)] [--split-h:100vh] xl:block" />
      <div className="split-blue absolute right-0 top-0 h-[3.75rem] w-[9.5rem] [--split-h:3.75rem] md:h-16 md:[--split-h:4rem] xl:hidden" />
      <div className="absolute inset-0 -skew-y-12 opacity-[0.07]">
        <div
          className={`absolute inset-y-0 left-0 w-[calc(100%+96px)] ${
            reducedMotion || !backgroundFx || mapOpen ? "" : "animate-stripe-drift"
          }`}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgb(var(--stripe)) 0px, rgb(var(--stripe)) 2px, transparent 2px, transparent 48px)",
          }}
        />
      </div>
    </div>
  );
}
