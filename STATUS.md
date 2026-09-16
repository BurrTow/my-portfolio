# Portfolio — current state

Snapshot of what is actually in the site right now, what is still placeholder,
and what is left to decide. Generated 2026-09-16.

## At a glance

| | |
| --- | --- |
| Tabs | Projects, Certificates, Repos, Resume |
| Real content | 3 projects, 6 certificates |
| Placeholder content | resume PDF, all project screenshots, 2 section subtitles |
| Identity on the site | **none** — the site never states whose portfolio it is |
| Deployed | no — source on GitHub, not hosted |
| Branch with latest work | `design/ui-exploration` (3 commits ahead of `master`) |

## Content

### Projects — real

All three are real, with full tech lists. Repo URLs are **kept but commented
out** in `src/data/projects.ts`, because the repositories are not public yet.
Uncomment one and that card switches from "Repo coming soon" to a live link
with no component change.

| Project | Tech | Repo |
| --- | --- | --- |
| Chelsy's Burger POS System | JavaScript, React, TailwindCSS, Electron, better-sqlite3, Recharts, Vite, ESLint | commented out |
| GastoAI | C++, Flutter, Dart, CMake | commented out |
| Basic Subnet Calculator | JavaScript, HTML, CSS, ESLint, Vite, GitHub Actions, GitHub Pages | none on file |

### Certificates — real

Six entries, each with a description. **No dates** — the source resume listed
none, and they were left out rather than invented, so cards show the issuer
alone.

| Certificate | Issuer |
| --- | --- |
| Introduction to Cybersecurity | Cisco Networking Academy |
| Introduction to Networks | Cisco Networking Academy |
| Networking Devices and Initial Configuration | Cisco Networking Academy |
| Lean Six Sigma — White Belt | Lean Six Sigma *(issuer unconfirmed)* |
| Lean Six Sigma — Yellow Belt | Lean Six Sigma *(issuer unconfirmed)* |
| NextGen Wealth Elite Academy Program | BPI Private Wealth |

### Repos — deliberately empty

`src/data/links.ts` is an empty array. The tab shows a "Repositories coming
soon" empty state rather than the fabricated repos it used to list. Add
entries and it becomes a grid again automatically.

### Resume — placeholder

Serves a 521-byte stub PDF at `public/resume-placeholder.pdf`, shown inline
plus a download button. This is the most obviously fake thing on the site.

## Design

- **Palette** — Persona 3 Reload menu colours, contrast-checked, not eyeballed:
  `#0E0E10` ground, `#2B6FFF` structure, `#F5F5F0` text, `#D91E36` accent.
  Blue surfaces that carry text use `#1E5FFF` because white on the brighter
  blue measures 3.98:1 and fails AA. Blue and red both fail as small text on
  black, so red is emphasis only — never body copy.
- **Shape language** — cut-corner surfaces built from two clipped layers
  rather than a border, since a `border` next to a `clip-path` leaves the
  diagonal unstroked. All diagonals run the same direction at fixed offsets.
- **Fonts** — three-tier stack: the real Fontworks faces first, then Adobe
  Fonts, then free OFL stand-ins. Renders authentically on a machine that has
  the fonts installed, degrades cleanly for everyone else.
- **Transitions** — slanted blue/red bars sweep across on tab change, cover
  around 150ms while content swaps underneath, then clear with the new panel
  revealing along a diagonal edge.

## Verified

- Build, typecheck, and lint clean
- 24/24 behaviour checks passing
- 60fps on desktop and mobile, idle and mid-transition
- No horizontal overflow at 375px or 1440px
- Keyboard navigation across tabs, visible focus ring on every interactive element
- `prefers-reduced-motion` disables the intro and the wipe; content still switches
- Renders correctly with the font CDN unreachable
- Zero dead or placeholder links

## Outstanding

**Needs your input**

1. **Identity** — no name, bio, or contact anywhere. A visitor cannot tell
   whose portfolio this is. Biggest gap.
2. **Real resume PDF** — replace the stub. Note the repo is public, so
   whatever is in that file becomes public permanently.
3. **Certificate dates** and the real **Lean Six Sigma issuer**.
4. **Project screenshots** — the `thumbnail` field exists on the type but
   nothing renders it yet.
5. **Two subtitles** are still generic filler: "A selection of things I've
   built, shipped, and broken along the way" (Projects) and "Credentials
   earned along the way" (Certificates).

**Decisions pending**

6. **Font direction** — Arsenal is authentic to Persona but is not the
   condensed, italic-leaning face the original brief asked for.
7. **Resume tab treatment** — a white PDF viewer inside a dark panel reads as
   a hole in the theme.
8. **Deployment** — nothing is hosted. Vercel plus a custom domain is the
   recommendation for job-hunting; the domain matters more than the host.
9. **Merge `design/ui-exploration` into `master`.** The background
   performance fix on that branch takes desktop from 20fps to 60fps and is a
   straight bug fix with no aesthetic opinion in it — worth merging
   regardless of how the transitions land.
