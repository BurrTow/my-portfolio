export type ButtonVariant = "primary" | "ghost";

// Shared focus treatment: every interactive surface uses this same ring so
// keyboard focus is consistent across nav, cards, buttons, and links.
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Label typography for slanted tabs: the nav rail and the map destination
 * list share it so the two read as the same control. */
export const TAB_LABEL =
  "-skew-x-6 font-ui text-lg font-semibold uppercase tracking-wide";

export function buttonClassNames(variant: ButtonVariant = "primary") {
  const base = `inline-flex items-center gap-2 px-5 py-2.5 font-ui font-semibold uppercase tracking-wide text-sm transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`;
  const styles =
    variant === "primary"
      ? "clip-notch bg-p3-blue-deep text-p3-white hover:bg-p3-blue"
      : "notched text-p3-white [--fill:theme(colors.p3-black.panel)] hover:[--fill:theme(colors.p3-blue.deep)] hover:on-accent";
  return `${base} ${styles}`;
}
