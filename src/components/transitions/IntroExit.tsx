import { motion } from "framer-motion";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePerfStore } from "@/store/usePerfStore";
import {
  EASE_HEAVY,
  SHATTER_DURATION,
  SHATTER_PIECES,
  SHATTER_STAGGER,
  WIPE_CLEAR_DURATION,
  WIPE_COVER_MS,
  WIPE_PANELS,
  WIPE_STAGGER,
  type IntroExitVariant,
} from "@/theme/introMotion";

/**
 * The once-per-session opening transition, distinct from the tab wipe.
 *
 * Both variants animate transform only and sit on an opaque field, so neither
 * composites a translucent full-viewport layer over moving content — the cost
 * that has bitten this screen before.
 *
 * Reduced motion and the low tier collapse to an instant cut rather than a
 * shortened animation: the point of the override is to remove the motion, not
 * to hurry it.
 */
export function IntroExit({
  variant,
  onComplete,
}: {
  variant: IntroExitVariant;
  onComplete: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const tier = usePerfStore((s) => s.tier);
  const instant = reducedMotion || tier === "low";

  useEffect(() => {
    if (instant) onComplete();
  }, [instant, onComplete]);

  if (instant) return null;

  if (variant === "shatter") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
        {Array.from({ length: SHATTER_PIECES }).map((_, i) => {
          // Alternating directions read as the panel splitting apart rather
          // than sliding away in one piece.
          const up = i % 2 === 0;
          return (
            <motion.div
              key={i}
              // A narrow skewed band, not a full-viewport layer clipped down
              // to one. Seven full-screen clip-path layers compositing at once
              // halved frame rate under CPU throttling; this is the same shape
              // at roughly a seventh of the area.
              className="absolute -top-1/4 h-[150%] bg-p3-black"
              style={{
                left: `${(i * 100) / SHATTER_PIECES}%`,
                width: `${100 / SHATTER_PIECES + 3}%`,
              }}
              initial={{ x: 0, y: 0, skewX: -12 }}
              animate={{
                x: up ? "-28vw" : "28vw",
                y: up ? "-115vh" : "115vh",
                skewX: -12,
              }}
              transition={{
                duration: SHATTER_DURATION,
                ease: EASE_HEAVY,
                delay: i * SHATTER_STAGGER,
              }}
              onAnimationComplete={() => {
                if (i === SHATTER_PIECES - 1) onComplete();
              }}
            />
          );
        })}
      </div>
    );
  }

  // Two-stage: heavy panels close over the frame, hold a beat, then clear.
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {Array.from({ length: WIPE_PANELS }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute -top-1/4 h-[150%] ${
            i === 1 ? "bg-p3-blue-deep" : "bg-p3-black"
          }`}
          style={{
            left: `${(i * 100) / WIPE_PANELS}%`,
            width: `${100 / WIPE_PANELS + 4}%`,
          }}
          initial={{ x: "-140vw", skewX: -12 }}
          animate={{ x: ["-140vw", "0vw", "0vw", "140vw"], skewX: -12 }}
          transition={{
            duration: WIPE_COVER_MS / 1000 + WIPE_CLEAR_DURATION + 0.18,
            times: [0, 0.3, 0.46, 1],
            ease: EASE_HEAVY,
            delay: i * WIPE_STAGGER,
          }}
          onAnimationComplete={() => {
            if (i === WIPE_PANELS - 1) onComplete();
          }}
        />
      ))}
    </div>
  );
}
