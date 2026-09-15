import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { introVariants } from "@/theme/motion";
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
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-ink"
        >
          <motion.h1
            initial={{ clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }}
            animate={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="-skew-x-6 font-display font-bold text-4xl text-beige sm:text-6xl"
          >
            PORTFOLIO
          </motion.h1>
          <span className="absolute bottom-8 font-ui text-xs uppercase tracking-widest text-beige/50">
            tap to skip
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
