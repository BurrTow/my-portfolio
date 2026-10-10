# Architecture

A single-page React app with no router. One screen, five content panels, and a
stack of overlays above them. Navigation is state, not URLs — see
[ADR 0005](adr/0005-typed-data-files.md) for why.

## The overlay stack

Everything mounts at once and layers by z-index. Nothing is "a route"; the
intro is an opaque sheet sitting on top of a nav and tab panel that are already
live underneath it.

| Layer | z | Component | Mounted |
| --- | --- | --- | --- |
| Intro exit panels | 60 | `IntroExit` | only while the intro is leaving |
| Title screen | 50 | `IntroSequence` | until dismissed or skipped |
| Lightbox | 50 | `ImageLightbox` | while open (portalled to `body`) |
| Tab wipe bars | 40 | `MaskWipe` | only during a tab change |
| Map screen | 30 | `MapScreen` | while `mapOpen` |
| Nav | 20 | `Nav` | always |
| Tab content | 0 | `Shell` → `SliceTransition` | always |
| Drifting stripes | −10 | `BackgroundFX` | always |

### Boot sequence

1. `main.tsx` renders `App`. No conditionals, no routing.
2. `IntroSequence` decides whether to show the title screen:
   `introDone || reducedMotion || localStorage["portfolio:intro-seen"]` skips it.
3. The title screen **never advances on a timer**. Leaving is always explicit —
   click, Enter, or Skip.
4. On dismissal `IntroExit` sweeps three heavy panels across the frame. When
   they fully cover it, it fires `onCover`.
5. `onCover` — not `onComplete` — is where the destination is chosen. Doing it
   on completion meant the panels cleared over the *old* view, which is the
   "flash of main content" bug. See
   [ADR 0002](adr/0002-wipe-over-shards.md).
6. `App.handleIntroFinish` picks the landing screen: `window.innerWidth >= 768
   && tier !== "low"` opens the map; anything smaller goes straight to the tabs.

### Why the lightbox is portalled

`SliceTransition` puts a `clip-path` on the tab wrapper. A clipped ancestor
becomes the containing block for `position: fixed` descendants — rendered in
place, a full-screen overlay sits inside the panel instead of over the viewport.
`ImageLightbox` renders into `document.body` to escape that.

The same clip is why its resting shape is inflated 2% past every edge: children
that paint slightly outside their box (the card hover) were being sliced off.

## Two motion systems, on purpose

| | [`theme/motion.ts`](../src/theme/motion.ts) | [`theme/introMotion.ts`](../src/theme/introMotion.ts) |
| --- | --- | --- |
| Used by | tabs, cards, nav, map, headings | the intro exit only |
| Runs | constantly | once per session |
| Tuned for | quick and unobtrusive | weight and drama |

They are separate because sharing them meant every tweak to the opening moment
also retuned ordinary navigation. `motion.ts` additionally exports the raw
easing curves (`EASE_SNAP`, `EASE_BLADE`) so keyframe animations can match.

Each transition is deliberately distinct:

- **`SliceTransition`** — diagonal clip-path reveal, for tab-to-tab content swaps.
- **`MaskWipe`** — skewed bars sweeping across, triggered by `navSeq`. Transform
  only, never clip-path: it spans the viewport, and clip-path is paint.
- **`mapScreenVariants`** — scale + fade. The map is a dialog opening *on top of*
  the page, not a content swap in the same slot, so it reads differently from
  tab navigation.

## State

### [`useUIStore`](../src/store/useUIStore.ts) — navigation

| Field | Purpose |
| --- | --- |
| `activeTab` | Which of the five tabs is showing. Defaults to `projects`. |
| `navSeq` | Increments on **every** navigation request, including re-selecting the current tab. `MaskWipe` watches this rather than `activeTab`, so confirming your current destination still plays a transition instead of looking broken. |
| `mapOpen` | Whether the map overlay is up. Also what `BackgroundFX` watches to freeze its drift. |
| `introDone` | Set once the intro finishes; also persisted to `localStorage`. |

`mapOpen` is load-bearing beyond the map itself. `MapScreen` runs its own exit
animation and only calls `onClose` when it finishes, which keeps `mapOpen` true
for the whole exit — and therefore keeps the backdrop frozen while a
semi-transparent screen is on top of it. Flipping it earlier reintroduces the
regression described in [performance](performance.md).

### [`usePerfStore`](../src/store/usePerfStore.ts) — capability flags

Holds `tier` plus one boolean per degradable feature (`backgroundFx`,
`mapBackdrop`). Features come off a ladder rather than all at once. Covered in
[performance](performance.md).

## Data layer

No CMS, no fetching, no async. Content is typed arrays compiled into the bundle.

| File | Feeds |
| --- | --- |
| [`data/site.ts`](../src/data/site.ts) | Name, tagline, bio, contact — read by the title screen, About tab and map status card |
| [`data/projects.ts`](../src/data/projects.ts) | Projects tab, detail view, demo panel |
| [`data/certificates.ts`](../src/data/certificates.ts) | Certificates tab and lightbox |
| [`data/links.ts`](../src/data/links.ts) | Repos tab (currently an empty array by design) |
| [`data/resume.ts`](../src/data/resume.ts) | Resume tab |

Types live in [`types/content.ts`](../src/types/content.ts). Optional fields are
the mechanism for empty states: no `repo` renders "Repo coming soon", no
`image` makes a certificate card inert, no `demo` renders no demo section. Those
are real expected states, not edge cases.

`MapDetail` derives its counts from the data arrays (`projects.length`) rather
than hardcoding numbers, so they cannot drift from what the tabs show.
