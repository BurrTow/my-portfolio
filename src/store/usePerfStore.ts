import { create } from "zustand";

export type PerfTier = "high" | "mid" | "low";

/**
 * Capability flags, degraded independently rather than as one switch. The
 * downgrade ladder drops the cheapest-to-lose thing first:
 *
 *   1. backgroundFx   — decorative only, nothing depends on it
 *   2. animatedSprite — the map still works, the cursor just jumps
 *   3. mapEnabled     — falls back to the flat nav, which is fully functional
 *
 * Ordering matters: navigation must be the last thing to go, never the first.
 */
export interface PerfFlags {
  backgroundFx: boolean;
  animatedSprite: boolean;
  mapEnabled: boolean;
}

const FLAGS_BY_TIER: Record<PerfTier, PerfFlags> = {
  high: { backgroundFx: true, animatedSprite: true, mapEnabled: true },
  mid: { backgroundFx: true, animatedSprite: false, mapEnabled: true },
  low: { backgroundFx: false, animatedSprite: false, mapEnabled: false },
};

interface PerfState extends PerfFlags {
  tier: PerfTier;
  /** True once the runtime frame monitor has overridden the static guess. */
  downgraded: boolean;
  setTier: (tier: PerfTier) => void;
  /** Drops the next capability on the ladder. No-op once everything is off. */
  downgrade: () => void;
}

export const usePerfStore = create<PerfState>((set, get) => ({
  tier: "high",
  downgraded: false,
  ...FLAGS_BY_TIER.high,
  setTier: (tier) => set({ tier, ...FLAGS_BY_TIER[tier] }),
  downgrade: () => {
    const s = get();
    if (s.backgroundFx) return set({ backgroundFx: false, downgraded: true });
    if (s.animatedSprite) return set({ animatedSprite: false, downgraded: true });
    if (s.mapEnabled) return set({ mapEnabled: false, tier: "low", downgraded: true });
  },
}));

// Dev-only handle so each tier can be exercised without faking hardware.
// Stripped from production builds by the import.meta.env.DEV guard.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __setTier?: (t: PerfTier) => void }).__setTier = (t) =>
    usePerfStore.getState().setTier(t);
}
