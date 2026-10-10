# ADR 0005 — Typed data files, not hardcoded JSX

**Status:** Accepted
**Date:** 2026-10-10

## Context

A portfolio's content changes far more often than its components. Projects get
added, repos go public, certificates arrive with dates and credential numbers.
Writing that into JSX means editing a component to change a sentence, and means
nothing stops two cards from drifting out of structural sync.

A CMS or a fetch layer would be heavier than the problem: the content is a few
dozen records that change a handful of times a year, and the site is static.

## Decision

All content lives in typed arrays under
[`src/data/`](../../src/data/), with interfaces in
[`types/content.ts`](../../src/types/content.ts). Components render whatever the
data says and hold no copy of their own.

**Optional fields are the mechanism for empty states.** This is the part that
earns the approach:

| Absent field | Rendered result |
| --- | --- |
| `repo` | "Repo coming soon" instead of a dead link |
| `image` on a certificate | Card is inert — no click target, so no empty modal |
| `demo` | No demo section at all |
| `repoLinks` empty | Repos tab shows a deliberate empty state |

Derived numbers are computed from the arrays rather than written down. The map
status card reads `projects.length`, so counts cannot drift from what the tabs
show.

## Consequences

Adding content is a typed edit the compiler checks, empty states are automatic,
and there is no fetching, loading state or error state anywhere in the app.

The cost is that content changes require a rebuild and a deploy, and that
non-technical editing is not possible. Both are acceptable for a personal site
maintained by its author.

Revisit only if someone other than the author needs to edit content.
