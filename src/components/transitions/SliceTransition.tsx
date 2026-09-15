import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { sliceVariants } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Wraps tab content with a diagonal clip-path wipe between panels. Keyed by
 * `id` so switching tabs always re-triggers the exit/enter sequence.
 */
export function SliceTransition({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div key={id}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={sliceVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
