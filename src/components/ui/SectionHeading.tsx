import { motion } from "framer-motion";
import { headingContainer, headingLetter } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Tab heading with a per-character reveal.
 *
 * The string is split into spans here rather than by a DOM-splitting library,
 * so the effect costs no dependency — React already owns this markup.
 *
 * Screen readers would otherwise spell a split heading out letter by letter, so
 * the real string stays in an sr-only node and the animated copy is hidden from
 * the accessibility tree. The readable text never depends on the animation.
 *
 * Remounts with the tab (SliceTransition is keyed on the active tab), so the
 * reveal replays on every navigation rather than only on first load.
 */
export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="mb-6">
      <h2 className="relative inline-block -skew-x-6 font-display text-3xl font-bold text-p3-white sm:text-4xl">
        {reducedMotion ? (
          title
        ) : (
          <>
            <span className="sr-only">{title}</span>
            {/* The clip is what makes each glyph wipe up from the baseline.
                pb leaves room for descenders so letters are not shaved at rest,
                and the 120% start keeps them clear of that padding. */}
            <motion.span
              aria-hidden="true"
              variants={headingContainer}
              initial="initial"
              animate="enter"
              className="flex overflow-hidden pb-[0.12em]"
            >
              {[...title].map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  variants={headingLetter}
                  className="inline-block whitespace-pre"
                >
                  {ch}
                </motion.span>
              ))}
            </motion.span>
          </>
        )}
        <span className="absolute -bottom-1 left-0 h-1.5 w-2/3 bg-p3-red" />
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-prose font-ui text-base text-p3-white/70">
          {subtitle}
        </p>
      )}
    </div>
  );
}
