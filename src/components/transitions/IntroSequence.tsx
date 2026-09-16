import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { site } from "@/data/site";
import { BLADE, EASE_BLADE, introVariants } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Returning visitors go straight to their destination. */
const SEEN_KEY = "portfolio:intro-seen";
/** Lets both continue styles be compared without a rebuild. */
const MODE_KEY = "portfolio:intro-mode";

export type IntroMode = "auto" | "prompt";
const DEFAULT_MODE: IntroMode = "auto";

/** Stage timings. Whole sequence lands at ~1.5s, inside the 1–2s budget. */
const TITLE_MS = 620;
const NAME_MS = 900;

function readMode(): IntroMode {
  try {
    return localStorage.getItem(MODE_KEY) === "prompt" ? "prompt" : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

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
 * Title screen: "PORTFOLIO" reveals, cuts to the name and tagline, then hands
 * off. Exiting bumps the navigation counter so the tab wipe plays over it —
 * the same transition used everywhere else rather than a bespoke one.
 *
 * The overlay is opaque. A translucent full-viewport layer over animated
 * content is what cost frame rate twice before on this project.
 */
export function IntroSequence({ onFinish }: { onFinish: () => void }) {
  const introDone = useUIStore((s) => s.introDone);
  const finishIntro = useUIStore((s) => s.finishIntro);
  const reducedMotion = usePrefersReducedMotion();

  const [mode] = useState<IntroMode>(readMode);
  const [stage, setStage] = useState<"title" | "name">("title");
  const [dismissed, setDismissed] = useState(false);

  // Reduced motion collapses the whole sequence rather than shortening it —
  // same hard override as the rest of the site, no partial version.
  const skipEntirely = introDone || reducedMotion || hasSeenIntro();

  const finish = useCallback(() => setDismissed(true), []);

  useEffect(() => {
    if (skipEntirely) {
      onFinish();
      finishIntro();
    }
  }, [skipEntirely, onFinish, finishIntro]);

  useEffect(() => {
    if (skipEntirely || dismissed) return;
    const toName = setTimeout(() => setStage("name"), TITLE_MS);
    // In prompt mode the sequence parks on the name and waits for input.
    const toEnd =
      mode === "auto"
        ? setTimeout(finish, TITLE_MS + NAME_MS)
        : undefined;
    return () => {
      clearTimeout(toName);
      if (toEnd) clearTimeout(toEnd);
    };
  }, [skipEntirely, dismissed, mode, finish]);

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

  const visible = !skipEntirely && !dismissed;

  return (
    <AnimatePresence
      onExitComplete={() => {
        finishIntro();
        onFinish();
      }}
    >
      {visible && (
        <motion.div
          initial="initial"
          exit="exit"
          variants={introVariants}
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

          {stage === "name" && mode === "prompt" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.45, 1] }}
              transition={{ delay: 0.35, duration: 1.6, repeat: Infinity }}
              className="absolute bottom-10 font-ui text-xs font-semibold uppercase tracking-widest text-p3-white/70"
            >
              Press Enter or click to continue
            </motion.p>
          )}
          {mode === "auto" && (
            <span className="absolute bottom-10 font-ui text-xs uppercase tracking-widest text-p3-white/40">
              Skip · Enter
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Dev-only: flip continue style and replay without editing code.
if (import.meta.env.DEV && typeof window !== "undefined") {
  const w = window as unknown as {
    __introMode?: (m: IntroMode) => void;
    __replayIntro?: () => void;
  };
  w.__introMode = (m) => {
    localStorage.setItem(MODE_KEY, m);
    localStorage.removeItem(SEEN_KEY);
  };
  w.__replayIntro = () => localStorage.removeItem(SEEN_KEY);
}
