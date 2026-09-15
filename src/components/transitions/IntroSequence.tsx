import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { BLADE, introVariants } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const AUTO_DISMISS_MS = 1400;

/**
 * Brief menu boot-up sequence shown once per session. Skippable via any
 * key/tap, and skipped entirely under prefers-reduced-motion so it never
 * blocks access to content.
 */
export function IntroSequence() {
  const introDone = useUIStore((s) => s.introDone);
  const finishIntro = useUIStore((s) => s.finishIntro);
  const reducedMotion = usePrefersReducedMotion();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (introDone || reducedMotion) return;
    const timer = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [introDone, reducedMotion]);

  const visible = !introDone && !reducedMotion && !dismissed;

  return (
    <AnimatePresence onExitComplete={finishIntro}>
      {visible && (
        <motion.div
          initial="initial"
          exit="exit"
          variants={introVariants}
          onClick={() => setDismissed(true)}
          role="button"
          aria-label="Skip intro"
          tabIndex={0}
          onKeyDown={() => setDismissed(true)}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-p3-black"
        >
          <motion.h1
            initial={{ clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }}
            animate={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" }}
            transition={BLADE}
            className="relative -skew-x-6 font-display text-4xl font-bold text-p3-white sm:text-6xl"
          >
            PORTFOLIO
            <span className="absolute -bottom-3 left-0 h-1.5 w-1/3 bg-p3-red" />
          </motion.h1>
          <span className="absolute bottom-8 font-ui text-xs uppercase tracking-widest text-p3-white/50">
            tap to skip
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
