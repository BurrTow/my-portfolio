# Portfolio — current state

Snapshot of what is actually in the site right now, what is still placeholder,
and what is left to decide. Updated 2026-09-16.

## At a glance

| | |
| --- | --- |
| Tabs | Projects, Certificates, Repos, Resume, About |
| Real content | 3 projects, 6 certificates, name / tagline / bio / contact |
| Placeholder content | resume PDF, all project screenshots, 2 section subtitles |
| Entry | title screen, then map (desktop) or flat tabs (mobile) |
| Deployed | no — source on GitHub, not hosted |
| Branches | `master` = reviewed work; `design/townmap-select` = map + title screen |

## Branches

`master` holds everything reviewed and settled: the palette, real content,
About tab, and the git hook. `design/townmap-select` adds the map screen and
the title screen on top and is **5 commits ahead** of `master`. Nothing on
either branch is pushed.

`design/ui-exploration` still points at the older walking-sprite map, which
was replaced by the pin-select design and is superseded.

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

### Identity — real

`src/data/site.ts` is the single place the name, tagline, bio, email, and
location are edited. The title screen and the About tab both read from it.
**No phone number anywhere**, deliberately: the repository is public, so
anything in that file is published permanently.

### Repos — deliberately empty

`src/data/links.ts` is an empty array. The tab shows a "Repositories coming
soon" empty state rather than the fabricated repos it used to list.

### Resume — placeholder

Still a 521-byte stub PDF at `public/resume-placeholder.pdf`, shown inline
plus a download button. The most obviously fake thing on the site.

## Screens

### Title screen

"PORTFOLIO" reveals behind a diagonal clip, cuts to the name and tagline at
~620ms, then **waits**. It never advances on a timer — leaving is always
explicit (click, Enter, or Skip). Skip is live from the first frame.
`localStorage` marks returning visitors so they go straight to their
destination.

On exit, a single routing check reuses the existing tier detection: desktop
and capable devices land on the map, small or low-tier devices land on the
flat nav already showing Projects.

### Map screen

A pin-select screen, not a walking map: an inline-SVG cityscape with five
pins, mirrored by a sidebar list that carries the same selection. Selection
is highlight-then-confirm; confirming sets the active tab so the normal tab
wipe plays. Every pin and row is directly clickable, and the flat tab nav is
never replaced — the map is an additional way in, not the only one.

The sidebar is the primary control, unaffected by the backdrop, so navigation
never depends on the illustration rendering.

### Flat tab nav

Five tabs. Mobile shortens two labels below `md` — `Work` and `Certs` — because
five tabs at 375px leave a 75px slot and "Certificates" needs 105px.

## Design

- **Palette** — Persona 3 Reload menu colours, contrast-checked, not eyeballed:
  `#0E0E10` ground, `#2B6FFF` structure, `#F5F5F0` text, `#D91E36` accent.
  Blue surfaces carrying text use `#1E5FFF` because white on the brighter blue
  measures 3.98:1 and fails AA. Blue and red both fail as small text on black,
  so red is emphasis only.
- **Shape language** — cut-corner surfaces built from two clipped layers rather
  than a border, since a `border` next to a `clip-path` leaves the diagonal
  unstroked. All diagonals run the same direction at fixed offsets.
- **Fonts** — three-tier stack: the real Fontworks faces first, then Adobe
  Fonts, then free OFL stand-ins.
- **Two separate transition systems.** `theme/motion.ts` holds the tab wipe,
  which runs constantly and stays quick. `theme/introMotion.ts` holds the
  once-per-session opening, which can afford weight. They are deliberately not
  shared, so tuning one never retunes the other.

## Performance tiering

Static detection from `hardwareConcurrency`, `deviceMemory`, and viewport
picks a starting tier; a frame monitor then measures reality and corrects it,
downgrading when ≥35% of frames in a 45-frame window exceed 25ms.

| Tier | Background drift | Map backdrop |
| --- | --- | --- |
| high / mid | yes | yes |
| low | no | no — sidebar list takes full width |

The map screen itself is never gated. It is navigation, and its sidebar is a
complete control on its own.

Dev-only console helpers: `__setTier('low')`, `__replayIntro()`,
`__introExit('shatter' \| 'wipe')`. Stripped from production builds.

## Verified

- Build, typecheck, and lint clean
- Intro guardrails 12/12; map and nav behaviour 15/15
- 60fps at baseline and with the map open, holding through 6× CPU throttling
- No horizontal overflow at 375px or 1440px
- Keyboard navigation throughout, visible focus ring on every interactive element
- `prefers-reduced-motion` collapses the intro, the exit, and the tab wipe
- Renders correctly with the font CDN unreachable
- Zero dead or placeholder links

Four frame-rate regressions were found and fixed by measuring rather than
assuming, all the same class — something painting or compositing more than it
needed to:

1. The background drift animated `background-position`, repainting the whole
   viewport every frame. Desktop ran at 20fps while idle.
2. The first map overlay was translucent over that animating backdrop, halving
   frame rate again.
3. The backdrop kept animating underneath the opaque map overlay where nobody
   could see it, costing 30fps whenever the map was open.
4. The first shatter exit used seven full-viewport clip-path layers and halved
   frame rate under CPU throttling.

The frame monitor also had to be sequenced behind the intro **and** given a
settle window: the moment the intro ends is the busiest of the session, and
sampling there downgraded machines that then held a steady 60fps.

## Outstanding

**Needs your input**

1. **Real resume PDF** — replace the stub. The repo is public, so whatever is
   in that file becomes public permanently.
2. **Certificate dates** and the real **Lean Six Sigma issuer**.
3. **Project screenshots** — the `thumbnail` field exists on the type but
   nothing renders it yet.
4. **Two subtitles** are still generic filler: "A selection of things I've
   built, shipped, and broken along the way" (Projects) and "Credentials
   earned along the way" (Certificates). Options drafted, not yet chosen.

**Decisions pending**

1. **Which intro exit ships** — shards or panel wipe. Both built. The wipe
   holds 60fps to 6× throttling where shards give up, so it is the safer
   default.
2. **Font direction** — Arsenal is authentic to Persona but is not the
   condensed, italic-leaning face the original brief asked for.
3. **Resume tab treatment** — a white PDF viewer inside a dark panel reads as
   a hole in the theme.
4. **Map backdrop art** — the cityscape is a generated placeholder, abstract
   and not place-specific.
5. **Map discoverability** — on mobile the map is never reached automatically
   and sits behind a corner button, so most phone visitors will never see it.
6. **Deployment** — nothing is hosted. Vercel plus a custom domain is the
   recommendation; the domain matters more than the host.
7. **Merging `design/townmap-select` into `master`**, and retiring
   `design/ui-exploration`.
