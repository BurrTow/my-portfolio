# ADR 0004 — Prototype in a separate Vite entry, not behind a flag

**Status:** Accepted
**Date:** 2026-10-10

## Context

A pause-menu design needed prototyping: layered panel entrances, a
shared-layout selection cursor, a cross-fading detail panel, per-character
kinetic text. Substantial enough to need a real screen to judge it on, and not
something that should touch the live site while being evaluated.

The obvious approach — a dev-only guard in `main.tsx` keyed off a query param —
was tried and is the reason this ADR exists. Touching the entry file to reach
an experiment puts the experiment's existence on the critical path of the real
app's boot. In a repo where a previous "3-line dev guard" in `main.tsx` is
remembered for breaking the intro, the map and all navigation, that is the
wrong trade.

## Decision

Prototype in a **separate root HTML entry** with its own mount file:

```
pause-lab.html                      → /pause-lab.html in dev
src/features/pause-lab/entry.tsx    → its own createRoot
```

Vite's dev server serves any root `.html` at its own path with no config. And
because `vite.config.ts` declares no extra `rollupOptions.input`, `npm run
build` ignores it entirely — the experiment **cannot** reach production, by
construction rather than by a runtime flag.

`main.tsx`, `App.tsx`, `index.html` and `vite.config.ts` stay byte-identical.

Two couplings remain and are accepted: `tsc -b` typechecks everything under
`src/`, so an experiment must compile and its dependencies must stay declared;
and Tailwind scans `src/**`, so experiment-only classes add a little CSS to the
production build.

## Consequences

Experiments are reachable, isolated, and provably absent from production. The
live site cannot break because of one.

The cost is a little duplication — the harness re-creates its own page chrome —
and the discipline to delete the entry once the design graduates. The pause-lab
itself was deleted after its visual language moved into the real nav and map;
its job was to prototype a look, not to ship.
