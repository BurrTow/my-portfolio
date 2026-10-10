# ADR 0001 — Framer Motion as the only animation library

**Status:** Accepted
**Date:** 2026-10-10

## Context

The site is animation-heavy: an intro sequence, a tab wipe, a map overlay, a
per-letter heading reveal and a glitch hover effect. Over several sessions
GSAP + SplitType were added for the per-character work, then anime.js was
considered for the map transition.

Each addition was locally reasonable. Together they meant three libraries doing
overlapping work, and Framer Motion was already load-bearing in 17 files
(`SliceTransition`, `MaskWipe`, `IntroSequence`, `IntroExit`, `Nav`, every
card) so it was never going to be the one removed.

Measured cost of the alternatives: GSAP ~28 kB gzip, SplitType ~4.5 kB, against
a ~97 kB gzip bundle. Roughly +33%, for effects that turned out to be
reproducible without them.

## Decision

Framer Motion is the only animation library. Effects that look like they need a
specialist library are built from React plus Framer, or plain CSS:

- **Per-character text** — split with `[...text].map()` in React. SplitType
  exists to split text already in the DOM; React owns that markup already.
- **Glitch hover** — one `requestAnimationFrame` loop and derived state.
- **Card hover pop** — a CSS transition, which the global
  `prefers-reduced-motion` rule neutralises for free.

## Consequences

Bundle stays flat; one mental model; one place where `prefers-reduced-motion`
is handled.

The cost is that a few effects are hand-written where a library call would have
been shorter, and anything needing a real timeline (complex sequencing,
scroll-driven scrubbing, morphing) would be more work here than with GSAP.

Revisit if a requirement genuinely needs timeline orchestration that Framer
cannot express — not because an effect is merely fiddly to hand-write.
