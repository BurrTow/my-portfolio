import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Label whose glyphs shuffle through noise and resolve, left to right.
 *
 * Split into spans in React rather than by a DOM-splitting library, so the
 * effect costs no dependency.
 *
 * Each glyph sits in a box sized by the real character, with the noise drawn on
 * top of it. That pins the label's width: swapping in a wider or narrower glyph
 * cannot reflow the row, and the split version measures the same as the plain
 * one, so nothing shifts when the effect starts.
 *
 * Screen readers would otherwise read the noise, so the real string stays in an
 * sr-only node and the animated copy is hidden from the accessibility tree.
 */
const NOISE = "▚▞▓▒░#%&@*+=<>/\\|";

/** How long one glyph stays scrambled, and the gap between neighbours. */
const CHAR_MS = 90;
const STAGGER_MS = 22;
/** Glyph swaps per character while it is scrambling. */
const SWAP_MS = 34;

export function GlitchLabel({
  text,
  active,
  className,
}: {
  text: string;
  /** While true, the shuffle plays once from the start. */
  active: boolean;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  // Elapsed milliseconds while running, or null when settled.
  const [elapsed, setElapsed] = useState<number | null>(null);

  const chars = [...text];
  const total = chars.length * STAGGER_MS + CHAR_MS;

  useEffect(() => {
    if (!active || reducedMotion) {
      setElapsed(null);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      if (t >= total) return setElapsed(null);
      setElapsed(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      setElapsed(null);
    };
  }, [active, reducedMotion, total]);

  if (reducedMotion) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => {
          const from = i * STAGGER_MS;
          const scrambling =
            elapsed !== null && elapsed >= from && elapsed < from + CHAR_MS;
          // Derived from the frame rather than Math.random, so rendering stays
          // pure and a re-render cannot reshuffle a glyph that already settled.
          const noise =
            NOISE[(i * 7 + Math.floor(elapsed! / SWAP_MS)) % NOISE.length];

          return (
            <span key={i} className="relative inline-block">
              {/* Sizes the box to the real glyph; never painted. */}
              <span className="invisible">{ch}</span>
              <span className="absolute left-1/2 top-0 -translate-x-1/2">
                {scrambling ? noise : ch}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
