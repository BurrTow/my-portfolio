import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { site } from "@/data/site";
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
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-p3-black px-6"
        >
          <motion.h1
            initial={{ clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }}
            animate={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" }}
            transition={BLADE}
            className="-skew-x-6 text-center font-display text-3xl font-bold text-p3-white sm:text-5xl"
          >
            {site.shortName}
          </motion.h1>
          {/* Sibling, not a child of the h1: the heading's reveal clip-path
              would clip an accent positioned outside its box. */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mt-4 h-1.5 w-24 origin-left bg-p3-red"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="mt-6 max-w-xs text-center font-ui text-sm uppercase tracking-wide text-p3-white/70 sm:max-w-2xl sm:text-base"
          >
            {site.tagline}
          </motion.p>
          <span className="absolute bottom-8 font-ui text-xs uppercase tracking-widest text-p3-white/50">
            tap to skip
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
