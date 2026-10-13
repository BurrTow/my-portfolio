# ADR 0007 — GSAP inside the demo carousel only

**Status:** Accepted — amends [ADR 0001](0001-framer-motion-only.md)
**Date:** 2026-10-13

## Context

[ADR 0001](0001-framer-motion-only.md) made Framer Motion the single animation
library and removed GSAP, because the effects it had been added for were
reproducible without it and it cost ~28 kB gzip on a ~97 kB bundle.

The demo carousel then needed more than a swap: direction-aware slide and fade,
a diagonal clip-path reveal, a drag that follows the finger and snaps or
springs back, and all of it surviving rapid clicks without leaving two frames
visible. That is imperative, interruptible, gesture-driven animation on
elements React re-renders underneath — the case Framer's declarative variants
are least suited to, and the one GSAP's `overwrite: "auto"` and `context()`
solve directly.

The bundle objection from 0001 only holds if the cost lands on everyone.

## Decision

Framer Motion remains the app-wide animation library: intro, tab wipe, map,
nav, cards, headings. **GSAP is used in exactly one place —
[`DemoPanel`](../../src/features/projects/DemoPanel.tsx)'s image carousel —
and is loaded with a dynamic `import("gsap")` when that carousel first mounts.**

Measured: the entry chunk went 308.28 kB → 311.96 kB (+3.7 kB, the carousel's
own code). GSAP is a **separate 70.83 kB / 28.18 kB gzip chunk** that is not
requested on first load, on the projects grid, or by any visitor who never
opens a project with a screenshot demo.

Constraints that come with it:

- Core only — no plugins, no `@gsap/react`.
- Every tween is created inside a `gsap.context()` scoped to the frame, and the
  context is reverted on unmount, so nothing leaks.
- `prefers-reduced-motion` is handled by `gsap.matchMedia`, collapsing to an
  instant swap with no tween at all.
- The clip-path reveal is gated to the `high` performance tier; clip-path is a
  paint operation, unlike the transform and opacity everything else uses.
- The carousel renders and works before GSAP arrives, and if the import ever
  fails, as a plain single-image view.

## Consequences

Two animation libraries exist in the repo, which is a real cost: a reader has
to know which belongs where, and a second way of doing things invites drift.
The rule that keeps it honest is narrow — **GSAP may only be imported inside
`features/projects/DemoPanel.tsx`.** Anything else wanting imperative animation
is a prompt to re-read this ADR, not to add a second import.

In exchange, visitors who never open a demo pay nothing, and the carousel gets
interruptible gesture animation that would have been considerably more code to
hand-write.

Revisit if a second feature needs imperative animation. At that point either
the rule or the lazy-loading stops being true, and this should be re-decided
rather than quietly extended.
