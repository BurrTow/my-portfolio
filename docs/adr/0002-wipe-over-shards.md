# ADR 0002 — Wipe, not shards, for the intro exit

**Status:** Accepted
**Date:** 2026-10-10

## Context

Two intro-exit treatments were built so they could be compared: **shatter**
(seven skewed bands flying apart) and **wipe** (three heavy panels that cover
the frame, hold, then clear). `DEFAULT_EXIT` shipped as `"shatter"`.

Two problems emerged.

**Performance.** The first shatter build used seven full-viewport `clip-path`
layers and halved frame rate at 4× CPU throttle. Rebuilding it as narrow skewed
bands — the same shape at roughly a seventh of the area — recovered it, but
seven moving pieces still degrade where three do not.

**Correctness.** Both variants chose the destination on animation *completion*.
Shatter reveals as it leaves, so the tabs underneath were visible for most of a
second before the map appeared — a flash of the wrong screen on every visit.

## Decision

Ship the wipe as the only exit. The shard variant, its constants, the
`portfolio:intro-exit` localStorage switch and the `__introExit` dev helper are
all removed — keeping the loser reachable only left a way to ship it by
accident, which is exactly what happened.

`IntroExit` now reports a separate `onCover` moment, timed from the same
constants the animation runs on, and the destination is swapped **while the
frame is covered**. The hold was widened (`WIPE_TIMES[2]` 0.46 → 0.56) because
panels land staggered: the original timing left only ~49 ms between full
coverage and the first panel leaving, which is three frames, and fewer under
throttle.

## Consequences

One exit treatment, no flash, and a covered window with real margin.

The cost is a slightly longer transition and the loss of a variant someone
liked. The panels also needed a 12 vh overhang past each viewport edge: they
are skewed, so landing at `x:0` does not mean the frame is covered — the shear
leaves a triangular wedge bare at each edge, which the title screen had been
hiding by accident.

Any future full-screen transition should assume the same trap: *covered* is a
geometric claim, and skewed geometry needs checking against pixels.
