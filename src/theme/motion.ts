import type { Transition, Variants } from "framer-motion";

/**
 * Central motion presets for the whole app. Every transition/tab/card
 * animation pulls from here so easing and timing stay consistent — tune the
 * feel once, not per-component. Persona UI reads as crisp and fast, so we
 * lean on short durations and snap/blade easings rather than spring bounce.
 */

/** Raw curves, exported so keyframe animations can reuse the same easing. */
export const EASE_SNAP = [0.22, 1, 0.36, 1] as const;
export const EASE_BLADE = [0.65, 0, 0.35, 1] as const;

export const SNAP: Transition = {
  duration: 0.22,
  ease: EASE_SNAP,
};

export const BLADE: Transition = {
  duration: 0.35,
  ease: EASE_BLADE,
};

/**
 * Diagonal mask wipe for tab content. The leading edge stays slanted through
 * the whole sweep — the right-hand points travel at different rates, so the
 * reveal cuts across the panel rather than sliding a flat wall over it. The
 * enter state overshoots to 130% at the top so the finished shape still
 * covers the full box and nothing stays clipped.
 */
export const sliceVariants: Variants = {
  initial: {
    clipPath: "polygon(0 0, 0 0, -30% 100%, -30% 100%)",
    opacity: 0,
  },
  // easeOut, not the shared BLADE curve: a reveal begins at zero area, so an
  // ease-in-out spends its slow opening on an empty panel. Front-loading it
  // means the content is already mostly there by the time the eye lands.
  enter: {
    clipPath: "polygon(0 0, 130% 0, 100% 100%, 0 100%)",
    opacity: 1,
    transition: {
      duration: 0.32,
      ease: "easeOut",
      opacity: { duration: 0.12 },
    },
  },
  // Near-instant. AnimatePresence in "wait" mode holds the incoming panel
  // until this finishes, so any real exit duration is a window where the old
  // content has gone and the new one has not arrived — a visible blank. The
  // bars cannot be relied on to cover it, since when they mount depends on
  // React's render timing, so the fix is to make the gap too short to read.
  exit: {
    opacity: 0,
    transition: { duration: 0.05, ease: "easeIn" },
  },
};

/**
 * Timing for the bar sweep that covers the moment content swaps.
 *
 * easeOut rushes the bars in so they reach full cover early, easeIn then
 * accelerates them away. Tuned by eye against captured frames — the numbers
 * below are the ones that read right, not a derivation.
 */
export const MASK_BAR_COUNT = 6;
export const MASK_DURATION = 0.55;
export const MASK_STAGGER = 0.022;
export const MASK_TIMES = [0, 0.42, 1];
export const MASK_EASE = ["easeOut", "easeIn"] as const;

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
