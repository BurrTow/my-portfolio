# Performance

The site measures the device rather than assuming, and degrades decoration
before it degrades anything functional.

## Tier detection

[`useDeviceTier`](../src/hooks/useDeviceTier.ts) makes a cheap static guess
before anything heavy renders:

| Tier | Condition |
| --- | --- |
| `high` | 8+ cores **and** (8 GB+ RAM or RAM unreported) on a non-mobile viewport |
| `mid` | 4+ cores, or a capable phone |
| `low` | Fewer cores, ≤2 GB RAM, or a small screen with few cores |

These signals are coarse and partly unavailable — `deviceMemory` is Chromium
only, `hardwareConcurrency` can be clamped for privacy, and neither says
anything about the GPU or thermal state. So this is a starting bucket, not a
verdict. If there is no signal at all it stays cautious rather than optimistic.

## The frame monitor

[`useFrameMonitor`](../src/hooks/useFrameMonitor.ts) then measures reality and
corrects the guess.

| Constant | Value | Why |
| --- | --- | --- |
| `WARMUP_MS` | 1500 | The moment the intro ends is the busiest of the session — the wipe plays and the map mounts. Sampling immediately measures that burst, not the device. |
| `SAMPLE_MS` | 3000 | Long enough to be representative, short enough to stop costing anything. |
| `SLOW_FRAME_MS` | 25 | ~40fps. Above this per frame, the device is not keeping up. |
| `SLOW_RATIO` | 0.35 | Fraction of slow frames in a window that counts as "consistently" slow. |
| `WINDOW` | 45 | Rolling sample size. |

It judges by the **proportion** of slow frames rather than a mean: one stall
while fonts land should not condemn a device, but a third of frames missing
budget is a real problem. It records timestamps only — reading layout per frame
would force reflow and starve the loop doing the measuring, making a healthy
page look slow.

Monitoring is held until the intro finishes, for the warmup reason above.

## The degradation ladder

[`usePerfStore`](../src/store/usePerfStore.ts) drops one capability at a time:

1. `backgroundFx` — the drifting stripe backdrop
2. `mapBackdrop` — the map's cityscape illustration and its pins

**The map screen itself is never gated.** It is navigation, and its sidebar
list is a complete, accessible control on its own, so removing it costs
usability and gains nothing. Only decoration comes off.

Dev-only handles exist for exercising each tier without faking hardware:

```js
__setTier('low')    // force a tier
__perfState()       // read current flags
__replayIntro()     // clear the seen flag so the intro plays again
```

## The known regression class

> **A translucent or semi-transparent full-viewport layer animating on top of
> other animating content.**

This has cost frame rate on this project more than once:

- An early shatter intro used seven full-viewport `clip-path` layers and halved
  frame rate at 4× throttle. Rebuilt as narrow skewed bands — the same shape at
  roughly a seventh of the area — it holds. See
  [ADR 0002](adr/0002-wipe-over-shards.md).
- A translucent overlay over the drifting backdrop halved frame rate in an
  earlier map build. Overlays are opaque now for exactly this reason.

The rules that follow from it:

- **Full-viewport overlays are opaque.** `MapScreen` and `ImageLightbox` both
  use solid `bg-p3-black`.
- **If a full-screen layer must be translucent, freeze what is underneath.**
  The map's scale+fade is the one place this is allowed, and only because
  `mapOpen` stays true for the whole animation, so `BackgroundFX` is frozen
  throughout. Change that ordering and it becomes the bug again.
- **Prefer transform and opacity over clip-path and layout** for anything
  screen-sized. Transform composites; clip-path paints.
- **Animate backdrop-filter's opacity, never its radius.** Re-blurring at a new
  kernel size every frame is the expensive half.

## Testing under 6× CPU throttle

Required for anything touching the map, the intro, or a full-screen overlay.

1. `npm run dev`, open the site.
2. DevTools → **Performance** → gear icon → **CPU: 6× slowdown**.
3. Record while triggering the transition. For the intro, run `__replayIntro()`
   in the console and reload first.
4. Read the frame chart. The bar to clear is the project's own:
   **fewer than 35% of frames over 25 ms.**

Verify the throttle is actually applied before trusting a result — a
busy-loop timing comparison between 1× and 6× should show roughly a 6×
slowdown. A measurement taken with the throttle silently off looks great and
means nothing.

Current measurements, all at 6×: tab switching, map open, map close and the
nav hover effect each hold 59.9 fps with 0–2% slow frames.
