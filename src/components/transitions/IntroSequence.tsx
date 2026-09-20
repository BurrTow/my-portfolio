import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { site } from "@/data/site";
import { BLADE, EASE_BLADE } from "@/theme/motion";
import { IntroExit } from "@/components/transitions/IntroExit";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Returning visitors go straight to their destination. */
const SEEN_KEY = "portfolio:intro-seen";

/** Only the reveal is timed. Nothing advances the screen on its own. */
const TITLE_MS = 620;

function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Storage blocked (private window, blocked site data) — replaying the
    // intro is a far smaller cost than failing to render at all.
    return false;
  }
}

/**
 * Title screen: "PORTFOLIO" reveals, cuts to the name and tagline, then waits.
 *
 * It never advances on its own. A visitor who leaves the tab open and comes
 * back should find the title screen, not be dropped somewhere they did not
 * ask to go, so leaving is always an explicit act — click, Enter, or Skip.
 *
 * The overlay is opaque. A translucent full-viewport layer over animated
 * content is what cost frame rate twice before on this project.
 */
export function IntroSequence({ onFinish }: { onFinish: () => void }) {
  const introDone = useUIStore((s) => s.introDone);
  const finishIntro = useUIStore((s) => s.finishIntro);
  const reducedMotion = usePrefersReducedMotion();

  const [stage, setStage] = useState<"title" | "name">("title");
  const [dismissed, setDismissed] = useState(false);
  const [covered, setCovered] = useState(false);

  // Reduced motion collapses the whole sequence rather than shortening it —
  // same hard override as the rest of the site, no partial version.
  const skipEntirely = introDone || reducedMotion || hasSeenIntro();

  const finish = useCallback(() => setDismissed(true), []);

  /**
   * Fired while the exit panels hide the whole frame.
   *
   * Both halves of the handover happen here, in one commit: the destination is
   * chosen and this screen stops rendering. Doing either one earlier leaves a
   * gap — dropping the title screen on dismiss shows the page underneath while
   * the panels are still sweeping in, and choosing the destination on
   * completion means the panels clear over the old view instead of the new one.
   */
  const handleCover = useCallback(() => {
    setCovered(true);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (skipEntirely) {
      onFinish();
      finishIntro();
    }
  }, [skipEntirely, onFinish, finishIntro]);

  useEffect(() => {
    if (skipEntirely || dismissed) return;
    // Only the stage change is timed. There is no timer that leaves.
    const toName = setTimeout(() => setStage("name"), TITLE_MS);
    return () => clearTimeout(toName);
  }, [skipEntirely, dismissed]);

  // Skip is live from the first frame, not only once the sequence settles.
  useEffect(() => {
    if (skipEntirely || dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(e.key)) {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skipEntirely, dismissed, finish]);

  // Held until the panels cover, not until the click: the title screen is what
  // they sweep in over.
  const visible = !skipEntirely && !covered;

  return (
    <>
      {dismissed && !skipEntirely && (
        <IntroExit onCover={handleCover} onComplete={finishIntro} />
      )}
      {visible && (
        <motion.div
          onClick={finish}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-p3-black px-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              finish();
            }}
            className="absolute right-4 top-4 font-ui text-xs font-semibold uppercase tracking-widest text-p3-white/60 underline-offset-4 hover:text-p3-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p3-red"
          >
            Skip
          </button>

          {stage === "title" ? (
            <motion.h1
              key="title"
              initial={{ clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }}
              animate={{ clipPath: "polygon(0 0,130% 0,100% 100%,0 100%)" }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={BLADE}
              className="-skew-x-6 font-display text-4xl font-bold tracking-wide text-p3-white sm:text-6xl"
            >
              PORTFOLIO
            </motion.h1>
          ) : (
            // A cut, not a crossfade: fading in from zero while the title has
            // already gone leaves a frame with nothing on screen. The name is
            // opaque immediately and revealed by the same diagonal clip used
            // for the title and for tab content.
            <motion.div key="name" className="flex flex-col items-center">
              <motion.h1
                initial={{ clipPath: "polygon(0 0,0 0,0 100%,0 100%)" }}
                animate={{ clipPath: "polygon(0 0,130% 0,100% 100%,0 100%)" }}
                transition={{ duration: 0.26, ease: EASE_BLADE }}
                className="-skew-x-6 text-center font-display text-3xl font-bold text-p3-white sm:text-5xl"
              >
                {site.shortName}
              </motion.h1>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.12, duration: 0.25 }}
                className="mt-4 h-1.5 w-24 origin-left bg-p3-red"
              />
              <p className="mt-6 max-w-xs text-center font-ui text-sm uppercase tracking-wide text-p3-white/70 sm:max-w-2xl sm:text-base">
                {site.tagline}
              </p>
            </motion.div>
          )}

          {stage === "name" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.45, 1] }}
              transition={{ delay: 0.3, duration: 1.8, repeat: Infinity }}
              className="absolute bottom-10 font-ui text-xs font-semibold uppercase tracking-widest text-p3-white/70"
            >
              Press Enter or click to continue
            </motion.p>
          )}
        </motion.div>
      )}
    </>
  );
}

// Dev-only: replay the intro without editing code or clearing storage by hand.
if (import.meta.env.DEV && typeof window !== "undefined") {
  const w = window as unknown as { __replayIntro?: () => void };
  w.__replayIntro = () => localStorage.removeItem(SEEN_KEY);
}
