import { useEffect } from "react";
import { usePerfStore, type PerfTier } from "@/store/usePerfStore";

/**
 * Cheap capability guess made before anything heavy renders.
 *
 * These signals are coarse and partly unavailable — deviceMemory is Chromium
 * only, hardwareConcurrency can be clamped for privacy, and neither says
 * anything about GPU or thermal state. So this is a starting bucket, not a
 * verdict: useFrameMonitor measures reality and corrects it.
 *
 * Thresholds:
 *   high — 8+ cores and (8GB+ RAM or unreported) on a non-mobile viewport
 *   mid  — 4+ cores, or a capable phone
 *   low  — anything less, or a small screen with few cores
 */
export function detectTier(): PerfTier {
  if (typeof navigator === "undefined") return "mid";

  const cores = navigator.hardwareConcurrency ?? 0;
  // Non-standard, Chromium-only; undefined elsewhere, so absence is not a fail.
  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  const isMobile = coarsePointer && smallScreen;

  if (cores === 0) return isMobile ? "low" : "mid"; // no signal: stay cautious
  if (cores <= 2 || (memory !== undefined && memory <= 2)) return "low";
  if (cores >= 8 && (memory === undefined || memory >= 8) && !isMobile) {
    return "high";
  }
  if (cores >= 4) return "mid";
  return "low";
}

export function useDeviceTier() {
  const setTier = usePerfStore((s) => s.setTier);
  useEffect(() => {
    setTier(detectTier());
  }, [setTier]);
}
