# ADR 0006 — Demo panel with on-demand media

**Status:** Accepted
**Date:** 2026-10-10

## Context

Projects are easier to judge when you can see them run, but the three projects
differ in kind: one is a hosted web app, one is a mobile app, one is desktop.
A single presentation does not fit all three.

Two constraints shaped this. Demo media is heavy — a walkthrough video dwarfs
the entire JS bundle — and `public/` ships files verbatim and uncompressed. And
the media does not exist yet: the panel had to be wired up before any recording
was made, without showing broken frames in the meantime.

## Decision

One `demo` block per project, with three shapes — `live`, `video`, `images` —
rendered by
[`DemoPanel`](../../src/features/projects/DemoPanel.tsx).

**Nothing loads until asked for.**

- `live`: the `<iframe>` is not in the DOM until "Launch demo" is pressed. A
  third-party page pulls its own scripts and fonts, and opening a project
  detail is not consent to that. An "Open in new tab" link always works, since
  framing can be refused by `X-Frame-Options` and that is undetectable from
  outside.
- `video`: `preload="none"` with a poster, so only the poster is fetched.
- `images`: these *do* load on mount — they are the content.

**A missing file renders "Demo coming soon", never broken media.** Each type
probes differently: the poster stands in for the video (with preload off the
clip is never requested, so it cannot report its own absence), and carousel
frames are probed individually with unreadable ones dropped.

The panel is deliberately motionless. There is no `prefers-reduced-motion`
branch because there is no motion — adding a crossfade purely to switch it off
again would be more code and more risk than the effect is worth.

## Consequences

A project detail costs nothing extra until a visitor asks for the demo, demos
can be declared before the files exist, and a half-delivered screenshot set
degrades to the frames that work.

The cost is three code paths instead of one, and a non-obvious coupling: **ship
the poster with the video**, because a video whose poster is missing shows the
placeholder. That is documented in [adding demos](../adding-demos.md).

The `live` frame also runs with `allow-same-origin`, which is only safe because
the framed page is cross-origin. Pointing it at a same-origin URL while scripts
are allowed would defeat the sandbox.
