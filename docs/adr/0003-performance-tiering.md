# ADR 0003 — Measure the device, degrade decoration only

**Status:** Accepted
**Date:** 2026-10-10

## Context

The site leans on continuous animation: a drifting stripe backdrop, full-screen
transitions, a map illustration. On weak hardware that is a frame-rate problem,
and the audience includes phones and shared lab machines.

Static capability detection alone is not enough. `deviceMemory` is Chromium
only, `hardwareConcurrency` can be clamped for privacy, and neither reports GPU
or thermal state. A desktop guess can be wrong in either direction.

The concrete failure that motivated this: a translucent full-viewport layer
animating over the drifting backdrop halved frame rate. The expensive thing was
not any single element but the *pairing* — something semi-transparent moving on
top of something else moving.

## Decision

Guess, then measure, then degrade a ladder.

1. [`useDeviceTier`](../../src/hooks/useDeviceTier.ts) buckets the device cheaply
   before anything heavy renders.
2. [`useFrameMonitor`](../../src/hooks/useFrameMonitor.ts) samples real frame
   times after a 1500 ms warmup and downgrades if ≥35% of frames exceed 25 ms.
3. [`usePerfStore`](../../src/store/usePerfStore.ts) drops capabilities one at a
   time: `backgroundFx` first, then `mapBackdrop`.

**Navigation is never degraded.** The map screen stays on every tier; only its
illustration comes off, and its sidebar list is a complete control by itself.

The monitor judges by the proportion of slow frames, not a mean — one stall
while fonts land should not condemn a device. It records timestamps only;
reading layout per frame would force reflow and starve the loop doing the
measuring.

## Consequences

Weak devices lose decoration and keep function, and the thresholds are a single
documented place to tune.

The cost is complexity in a small site, plus a standing constraint on every new
overlay: full-viewport layers must be opaque, or whatever is beneath them must
be frozen for the duration. That rule is why `mapOpen` stays true through the
map's exit animation rather than flipping at its start.

See [performance](../performance.md) for thresholds and the test procedure.
