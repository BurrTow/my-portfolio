import { useEffect } from "react";
import { usePerfStore } from "@/store/usePerfStore";

/**
 * Ignore the first stretch after mount. Startup legitimately drops frames —
 * React mounting, fonts arriving, the intro sequence playing — and none of it
 * reflects steady-state capability. Sampling from zero downgraded machines
 * that then ran at a solid 60fps.
 */
const WARMUP_MS = 1800;
const SAMPLE_MS = 3000;
/** ~40fps. Above this per frame and the device is not keeping up. */
const SLOW_FRAME_MS = 25;
/** Fraction of slow frames in a window that counts as "consistently" slow. */
const SLOW_RATIO = 0.35;
const WINDOW = 45;

/**
 * Watches real frame times for a few seconds after load and downgrades if the
 * device is not keeping up, correcting whatever the static guess assumed.
 *
 * Records timestamps only. Reading layout per frame (getBoundingClientRect and
 * friends) forces reflow and starves the very loop doing the measuring, which
 * makes a healthy page look slow and can trigger a downgrade that is purely an
 * artefact of observing it.
 *
 * Judges by the proportion of slow frames rather than a mean: one stall while
 * fonts land should not condemn the device, but a third of frames missing
 * their budget is a real problem.
 */
export function useFrameMonitor(enabled = true) {
  const downgrade = usePerfStore((s) => s.downgrade);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let raf = 0;
    let last = performance.now();
    const mounted = last;
    let recent: number[] = [];
    let stopped = false;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;

      if (now - mounted < WARMUP_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }

      recent.push(delta);
      if (recent.length > WINDOW) recent.shift();

      if (recent.length === WINDOW) {
        const slow = recent.filter((d) => d > SLOW_FRAME_MS).length;
        if (slow / recent.length >= SLOW_RATIO) {
          downgrade();
          // Start a fresh window so one bad patch cannot cascade through
          // several downgrades before the change has had time to take effect.
          recent = [];
        }
      }

      if (now - mounted < WARMUP_MS + SAMPLE_MS && !stopped)
        raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled, downgrade]);
}
