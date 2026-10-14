/**
 * Initials in place of a photo, in the site's cut-corner frame.
 *
 * Decorative by design: every slot that uses this prints the name in text
 * right beside it, so the emblem is hidden from assistive tech rather than
 * announced twice.
 */

/** The two slots that exist: the About card and the map status card. */
const SIZES = {
  sm: { frame: "h-20 w-16 gap-1.5", letters: "text-3xl", rule: "w-5" },
  lg: { frame: "h-36 w-28 gap-3", letters: "text-5xl", rule: "w-8" },
} as const;

export function MonogramEmblem({
  size = "lg",
}: {
  size?: keyof typeof SIZES;
}) {
  const { frame, letters, rule } = SIZES[size];

  return (
    <div
      aria-hidden
      className={`notched flex shrink-0 flex-col items-center justify-center ${frame} [--fill:theme(colors.p3-black.raised)]`}
    >
      <span
        className={`-skew-x-6 font-display font-bold leading-none text-p3-blue ${letters}`}
      >
        RS
      </span>
      <span className={`h-0.5 -skew-x-12 bg-p3-red ${rule}`} />
    </div>
  );
}
