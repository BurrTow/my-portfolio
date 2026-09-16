import { create } from "zustand";

export type PerfTier = "high" | "mid" | "low";

/**
 * Capability flags, degraded independently rather than as one switch.
 *
 * The pin-select map has no motion of its own, so the ladder is short — only
 * decorative weight comes off:
 *
 *   1. backgroundFx  — the drifting stripe backdrop behind the whole site
 *   2. mapBackdrop   — the map's illustration; pins go with it
 *
 * The map screen itself is never gated. It is navigation, and its sidebar
 * list is a complete, accessible control on its own, so there is nothing to
 * gain by removing it and a usability cost to doing so.
 */
export interface PerfFlags {
  backgroundFx: boolean;
  mapBackdrop: boolean;
}

const FLAGS_BY_TIER: Record<PerfTier, PerfFlags> = {
  high: { backgroundFx: true, mapBackdrop: true },
  mid: { backgroundFx: true, mapBackdrop: true },
  low: { backgroundFx: false, mapBackdrop: false },
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
    if (s.mapBackdrop)
      return set({ mapBackdrop: false, tier: "low", downgraded: true });
  },
}));

// Dev-only handle so each tier can be exercised without faking hardware.
// Stripped from production builds by the import.meta.env.DEV guard.
if (import.meta.env.DEV && typeof window !== "undefined") {
  const w = window as unknown as {
    __setTier?: (t: PerfTier) => void;
    __perfState?: () => PerfState;
  };
  w.__setTier = (t) => usePerfStore.getState().setTier(t);
  w.__perfState = () => usePerfStore.getState();
}
