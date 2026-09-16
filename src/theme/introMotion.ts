/**
 * Motion for the intro exit only.
 *
 * Deliberately separate from theme/motion.ts: the tab wipe runs many times a
 * session and has to stay quick and unobtrusive, while this plays once and
 * can afford weight. Sharing presets would mean every tweak to the opening
 * moment also retuned ordinary navigation.
 */

export type IntroExitVariant = "shatter" | "wipe";

export const EASE_HEAVY = [0.7, 0, 0.2, 1] as const;

/** Shards break along the site's diagonal, then clear the frame. */
export const SHATTER_PIECES = 7;
export const SHATTER_DURATION = 0.78;
export const SHATTER_STAGGER = 0.045;

/** Two passes: a heavy cover, then a slower reveal. */
export const WIPE_PANELS = 3;
export const WIPE_COVER_MS = 380;
export const WIPE_CLEAR_DURATION = 0.62;
export const WIPE_STAGGER = 0.07;

