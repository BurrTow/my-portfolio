import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  EASE_BLADE,
  MASK_BAR_COUNT,
  MASK_DURATION,
  MASK_STAGGER,
} from "@/theme/motion";

// Mostly blue with a single red bar as punctuation, matching how the palette
// uses red everywhere else.
const BAR_COLOR = (i: number) =>
  i === 2 ? "bg-p3-red" : i % 2 === 0 ? "bg-p3-blue-deep" : "bg-p3-blue-dark";

/**
 * Persona-style bar sweep played over a tab change: slanted bars rush across,
 * cover the screen at the midpoint, then clear. Content swaps underneath while
 * covered, so the switch reads as one deliberate motion instead of a fade.
 *
 * Bars animate transform only (translate + skew), never layout or clip-path,
 * so the sweep stays cheap even with the background animation running.
 */
export function MaskWipe() {
  const activeTab = useUIStore((s) => s.activeTab);
  const reducedMotion = usePrefersReducedMotion();
  const [sweep, setSweep] = useState(0);
  // Compare against the last tab rather than guarding on "first run": under
  // StrictMode the effect is invoked twice on mount, and a boolean guard would
  // burn itself on the first pass and fire a spurious sweep on the second.
  const lastTab = useRef(activeTab);

  useEffect(() => {
    if (lastTab.current === activeTab) return;
    lastTab.current = activeTab;
    setSweep((n) => n + 1);
  }, [activeTab]);

  if (reducedMotion || sweep === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {/* Remounting on each sweep replays the one-shot keyframes. */}
      <div key={sweep} className="absolute inset-0">
        {Array.from({ length: MASK_BAR_COUNT }).map((_, i) => (
          <motion.span
            key={i}
            className={`absolute -top-1/4 h-[150%] ${BAR_COLOR(i)}`}
            style={{
              left: `${(i * 100) / MASK_BAR_COUNT}%`,
              width: `${100 / MASK_BAR_COUNT + 4}%`,
            }}
            // Travel is in vw, not %: a percentage translate resolves against
            // the bar's own width (~1/6 of the screen), so the bars would stop
            // a third of the way across and sit there covering the content.
            // skewX rides in the same transform because Framer Motion writes
            // `transform` wholesale and would drop a Tailwind skew class.
            initial={{ x: "-130vw", skewX: -12 }}
            animate={{ x: ["-130vw", "0vw", "130vw"], skewX: -12 }}
            transition={{
              duration: MASK_DURATION,
              times: [0, 0.42, 1],
              ease: EASE_BLADE,
              delay: i * MASK_STAGGER,
            }}
          />
        ))}
      </div>
    </div>
  );
}
