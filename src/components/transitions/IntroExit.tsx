import { motion } from "framer-motion";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePerfStore } from "@/store/usePerfStore";
import {
  EASE_HEAVY,
  WIPE_COVERED_MS,
  WIPE_DURATION,
  WIPE_EDGE_OVERHANG,
  WIPE_PANELS,
  WIPE_STAGGER,
  WIPE_TIMES,
} from "@/theme/introMotion";

/**
 * The once-per-session opening transition, distinct from the tab wipe.
 *
 * Heavy panels sweep in, hold the frame covered, then clear. They animate
 * transform only and sit on an opaque field, so nothing composites a
 * translucent full-viewport layer over moving content — the cost that has
 * bitten this screen before.
 *
 * `onCover` fires while the frame is fully covered; that is when the caller
 * should swap in whatever comes next. `onComplete` fires when the panels have
 * left. Doing the swap on completion instead is what let the destination show
 * through mid-transition.
 *
 * Reduced motion and the low tier collapse to an instant cut rather than a
 * shortened animation: the point of the override is to remove the motion, not
 * to hurry it. Both callbacks fire together in that case, so the caller's
 * sequencing is identical either way.
 */
export function IntroExit({
  onCover,
  onComplete,
}: {
  onCover: () => void;
  onComplete: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const tier = usePerfStore((s) => s.tier);
  const instant = reducedMotion || tier === "low";

  useEffect(() => {
    if (!instant) return;
    onCover();
    onComplete();
  }, [instant, onCover, onComplete]);

  useEffect(() => {
    if (instant) return;
    // Framer Motion has no per-keyframe callback, so the covered moment is
    // timed from the same constants the animation runs on rather than guessed.
    const timer = setTimeout(onCover, WIPE_COVERED_MS);
    return () => clearTimeout(timer);
  }, [instant, onCover]);

  if (instant) return null;

  return (
    // overflow-hidden so the overhanging outer panels cannot widen the page.
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {Array.from({ length: WIPE_PANELS }).map((_, i) => {
        // Only the outer edges reach past the viewport; the seams between
        // panels stay aligned because every panel carries the same skew.
        const first = i === 0;
        const last = i === WIPE_PANELS - 1;
        const base = (i * 100) / WIPE_PANELS;
        const span = 100 / WIPE_PANELS + 4;
        return (
          <motion.div
            key={i}
            className={`absolute -top-1/4 h-[150%] ${
              i === 1 ? "bg-p3-blue-deep" : "bg-p3-black"
            }`}
            style={{
              left: first
                ? `calc(${base}% - ${WIPE_EDGE_OVERHANG})`
                : `${base}%`,
              width:
                first || last
                  ? `calc(${span}% + ${WIPE_EDGE_OVERHANG})`
                  : `${span}%`,
            }}
            initial={{ x: "-140vw", skewX: -12 }}
            animate={{ x: ["-140vw", "0vw", "0vw", "140vw"], skewX: -12 }}
            transition={{
              duration: WIPE_DURATION,
              times: WIPE_TIMES,
              ease: EASE_HEAVY,
              delay: i * WIPE_STAGGER,
            }}
            onAnimationComplete={() => {
              if (last) onComplete();
            }}
          />
        );
      })}
    </div>
  );
}
