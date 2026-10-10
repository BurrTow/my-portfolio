## Engineering discipline

Avoid over-engineering. Only make changes that are directly requested or clearly
necessary. Keep solutions simple and focused:

- **Scope:** Don't add features, refactor code, or make "improvements" beyond what
  was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature
  doesn't need extra configurability. If something adjacent looks broken or worth
  improving, mention it — don't fix it inline.

- **Documentation:** Don't add docstrings, comments, or type annotations to code
  you didn't change. Only add comments where the logic isn't self-evident.

- **Defensive coding:** Don't add error handling, fallbacks, or validation for
  scenarios that can't happen. Trust internal code and framework guarantees. Only
  validate at system boundaries (user input, external APIs).

  This does NOT apply to fallbacks that are explicit product requirements on this
  site — empty states (no repo link yet, empty projects/certs array),
  `prefers-reduced-motion` overrides, device-tier downgrades (map → flat nav on
  low tier), and any other behavior specified in a prompt. Those are real,
  expected states for real visitors, not speculative edge cases — build them
  fully, don't treat them as scope creep.

- **Abstractions:** Don't create helpers, utilities, or abstractions for one-time
  operations. Don't design for hypothetical future requirements. The right amount
  of complexity is the minimum needed for the current task.

- **Verification, not just restraint:** This section limits what you add — it
  doesn't reduce what you verify. Before calling something done: confirm it
  works (test the actual interaction/behavior, don't assume), check fps/paint
  cost for anything touching the map or intro screens (this codebase has hit
  the same translucent-full-viewport-layer bug twice), and report what you
  actually tested — not just what you built.

- **Before touching any shared/entry file** (main.tsx, App.tsx, routing, or anything
  outside an isolated feature folder), read and understand its current behavior first,
  and confirm your understanding before changing it. A "small" addition to a shared
  file is exactly the kind of change most likely to break something unrelated — treat
  these files with more caution than isolated feature code, not less. This is not
  hypothetical: a previous session's "3-line dev guard" in main.tsx broke the intro
  screen, the map screen, and all navigation entirely.

## Conventions

- **Commit convention: Conventional Commits.** `feat:`, `fix:`, `docs:`,
  `refactor:`, `perf:`, `chore:`, with an optional scope — `feat(demo): …`.
  The subject stays imperative and lowercase after the prefix.

- **Docs live in `README.md` and `docs/`.** Behaviour worth explaining belongs
  there, not only in commit messages: [`docs/architecture.md`](docs/architecture.md)
  for how the layers fit together, [`docs/performance.md`](docs/performance.md)
  for the tiering and the regression class, [`docs/adding-demos.md`](docs/adding-demos.md)
  for demo media, and [`docs/adr/`](docs/adr/) for decisions and their
  trade-offs. A decision that reverses an ADR should add a new one rather than
  edit the old.
