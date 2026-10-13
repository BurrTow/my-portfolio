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

**One exception sits outside both.** The demo carousel in
[`DemoPanel`](../src/features/projects/DemoPanel.tsx) uses GSAP, loaded with a
dynamic import when the carousel first mounts, for direction-aware slides and
a drag that follows the finger. It is the only GSAP in the codebase and it is
not in the entry chunk — see [ADR 0007](adr/0007-gsap-in-the-demo-carousel.md).

Each transition is deliberately distinct:

- **`SliceTransition`** — diagonal clip-path reveal, for tab-to-tab content swaps.
- **`MaskWipe`** — skewed bars sweeping across, triggered by `navSeq`. Transform
  only, never clip-path: it spans the viewport, and clip-path is paint.
- **`mapScreenVariants`** — scale + fade. The map is a dialog opening *on top of*
  the page, not a content swap in the same slot, so it reads differently from
  tab navigation.

## Map interaction

The map is mouse-first, and what it offers depends on the input device and the
performance tier. Nothing here is keyboard-facing: the arrow/Enter/Escape flow
is unchanged by any of it.

### Input modality

Read from `(pointer: fine)`, not from screen size.

| | fine pointer (mouse) | coarse pointer (touch) |
| --- | --- | --- |
| Pin hover | scale 1.12, blue glow, label lifts | none — there is no hover to preview with |
| Pin activation | **one click travels** | tap to select, tap again to confirm |
| Parallax | yes, on high tier | never |

Two details make the touch path work, and both are easy to regress:

- Pins hover-select on **`pointerenter` with `pointerType === "mouse"`**, not
  `mouseenter`. A touch tap fires the compatibility mouse events too, so
  `mouseenter` would pre-select the pin and turn the first tap into a confirm.
- Pins focus-select only when the button matches **`:focus-visible`**. A tap
  focuses the button as well, with the same consequence. Keyboard focus still
  selects, which is what Tabbing to a pin relies on.

### Depth planes

[`CityscapeBackdrop`](../src/features/map/CityscapeBackdrop.tsx) is five
stacked planes of inline SVG, back to front:

| Plane | Contents | Shift |
| --- | --- | --- |
| sky | sky gradient and the diagonal light shafts | **+6px** |
| far | small hazy skyline, lightest and bluest | −4px |
| mid | mid buildings, first lit windows | −9px |
| near | largest darkest buildings, with side faces — **pins live here** | −14px |
| fore | left/right/street silhouettes framing the frame | −16px |

`shift` is how far a plane travels against the pointer. The sky takes a
**positive** value so the shafts move *with* the cursor while the buildings
move against it, which widens the apparent gap between them.

Depth is painted, not filtered. Atmospheric perspective carries it — far
planes lighter, bluer and lower contrast, near planes darker with sharper
windows — plus an angled side face on the nearest buildings so they read as
volumes, a static street-level fog gradient and a vignette. **No blur, no
backdrop-filter, no animated filters anywhere.**

Every plane is drawn at `OVERSIZE = 1.09` and the frame clips, so neither the
shift nor the tilt can expose an edge. Pins render as children of the near
plane, so their hit areas ride the same transform as the buildings — verified
by hit-testing at maximum tilt.

**There is no CSS 3D.** An earlier build of this used `perspective: 1200px`,
`preserve-3d` and per-plane `translateZ` with scale compensation. It measured
**30fps with 59% of frames over budget, even unthrottled**, and tripped the
frame monitor into downgrading itself. The same five planes under a flat 2D
transform hold 60fps: a continuously changing 3D transform re-rasterises the
vector artwork every frame instead of compositing it, and `will-change` did not
help. The tilt is now a 2D `rotate` of at most 2°.

### Travelling to a destination

Confirming is distinct from dismissing, and uses a different exit:

- **Dismiss** (Escape, Close) — the existing scale-and-fade, unchanged.
- **Confirm** (pin click, Enter, Travel) — the backdrop zooms to 1.6 with its
  `transform-origin` on the chosen pin while the panel fades, ~280ms.

The destination tab is set **at the start** of that zoom, while the opaque map
still covers the screen, so the old page is never visible during the hand-off.
`MaskWipe` is already listening on `navSeq` and plays over the top; no second
wipe system exists. Pointer events are disabled on the dialog for the duration,
so a double click cannot fire two navigations.

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
