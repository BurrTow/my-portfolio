import type { Transition, Variants } from "framer-motion";

/**
 * Central motion presets for the whole app. Every transition/tab/card
 * animation pulls from here so easing and timing stay consistent — tune the
 * feel once, not per-component. Persona UI reads as crisp and fast, so we
 * lean on short durations and snap/blade easings rather than spring bounce.
 */

export const SNAP: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

export const BLADE: Transition = {
  duration: 0.35,
  ease: [0.65, 0, 0.35, 1],
};

/** Diagonal slice wipe used for tab-content transitions. */
export const sliceVariants: Variants = {
  initial: {
    clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
    opacity: 0,
  },
  enter: {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    opacity: 1,
    transition: { ...BLADE, opacity: { duration: 0.15 } },
  },
  exit: {
    clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
    opacity: 0,
    transition: { ...BLADE, opacity: { duration: 0.12 } },
  },
};

/** Nav blade items sliding in from the edge, staggered. */
export const bladeListVariants: Variants = {
  initial: {},
  enter: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

export const bladeItemVariants: Variants = {
  initial: { x: -24, opacity: 0 },
  enter: { x: 0, opacity: 1, transition: SNAP },
};

export const bladeItemVariantsMobile: Variants = {
  initial: { y: 16, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: SNAP },
};

/** Active-tab selection highlight — sharp snap, no overshoot. */
export const selectionHighlightTransition: Transition = SNAP;

/** Card/button hover + tap feedback — immediate, no lag. */
export const pressableVariants: Variants = {
  rest: { scale: 1, skewX: 0 },
  hover: { scale: 1.02, transition: { duration: 0.12, ease: "easeOut" } },
  tap: { scale: 0.97, transition: { duration: 0.08, ease: "easeOut" } },
};

/** Staggered reveal for list/grid content within a tab. */
export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  initial: { y: 12, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: SNAP },
};

/** Intro boot sequence — brief, skippable, not repeated on every visit. */
export const introVariants: Variants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};
