# Portfolio — Persona 3 Reload-styled menu UI

A personal portfolio whose navigation behaves like the Persona 3 Reload menu
system: diagonal blade cuts, a snappy selection highlight, and a slice-wipe
transition between tabs — built on a beige/black (paper + ink) palette.

## Stack

- **Vite + React 18 + TypeScript** (strict mode)
- **Tailwind CSS** — color tokens, clip-path utilities, and motion easings
  defined in [tailwind.config.js](tailwind.config.js). Note the `notched` /
  `bladed` utilities: a plain `border` next to a `clip-path` renders broken
  (the clip erases the border along the diagonal and leaves the straight
  edges hanging), so outlined cut-corner surfaces are built from two clipped
  layers instead. Set the inner color with `[--fill:...]`, the outline color
  with `[--edge:...]`, and its thickness with `[--edge-w:...]`.
- **Framer Motion** — all transitions pull from the shared presets in
  [src/theme/motion.ts](src/theme/motion.ts)
- **Zustand** — tiny global store for the active tab and intro-seen flag
  ([src/store/useUIStore.ts](src/store/useUIStore.ts))
- **No React Router.** There are no distinct routes here, just one screen
  with four menu panels, so tab state lives in Zustand instead — see the
  comment at the top of `useUIStore.ts` for the reasoning.

### Fonts

Persona 3/4 use two Fontworks faces: **FOT-Chiaro Std B** (display) and
**FOT-Skip Std B** (dialogue/UI). Both are commercial, so the stacks in
[tailwind.config.js](tailwind.config.js) name them first and fall back:

| Tier | Display | UI |
| --- | --- | --- |
| Real font, installed locally | `FOT-Chiaro Std B` | `FOT-Skip Std B` |
| Adobe Fonts web kit | `fot-chiaro-std` | — (not on Adobe Fonts) |
| Free OFL stand-in | `Arsenal` | `Zen Kaku Gothic New` |

So it renders authentically on a machine that has the fonts installed, and
degrades to a close free match for everyone else. The free tier is loaded
from Google Fonts in [index.html](index.html).

To serve the real Chiaro to all visitors, activate
[FOT-Chiaro Std on Adobe Fonts](https://fonts.adobe.com/fonts/fot-chiaro-std)
(web use is included with a Creative Cloud plan) and uncomment the
`use.typekit.net` link in `index.html` with your kit id — the stacks already
name it, so nothing else changes. FOT-Skip is not on Adobe Fonts; it's only
available through Fontworks' LETS or mojimo subscriptions.

**Don't commit the Fontworks font files.** Having them installed on your own
machine is fine; checking them into the repo or serving them from the site
would be redistributing a licensed font.

## Project structure

```text
src/
  components/
    layout/        Shell, Nav (desktop blade menu + mobile tab bar), BackgroundFX
    ui/             Button, LinkButton, Card, Panel, Tag, SectionHeading
    transitions/    SliceTransition (tab wipe), IntroSequence (boot screen)
  features/
    projects/       ProjectsTab, ProjectCard, ProjectDetail
    certificates/   CertificatesTab, CertificateCard
    links/          ReposTab, RepoCard
    resume/         ResumeTab
  data/             projects.ts, certificates.ts, links.ts, resume.ts — typed content
  theme/            motion.ts — every Framer Motion variant/transition, defined once
  hooks/            usePrefersReducedMotion, useArrowKeyTabNav
  store/            useUIStore.ts — active tab + intro-seen state
  types/            content.ts — Project, Certificate, RepoLink, ResumeMeta
```

## Adding content

Nothing below `data/` needs a component change — add an entry to the array
and it shows up.

- **Projects**: add an object to `src/data/projects.ts` matching the
  `Project` type in `src/types/content.ts` (`title`, `description`, `tech`,
  optional `link`/`repo`, `year`).
- **Certificates**: add to `src/data/certificates.ts` (`name`, `issuer`,
  `date`, optional `verifyUrl`).
- **Repos**: add to `src/data/links.ts` (`name`, `description`, `url`,
  optional `language`/`stars`).
- **Resume**: replace `public/resume-placeholder.pdf` with your real PDF
  (keep the filename, or update `fileUrl` in `src/data/resume.ts`), and bump
  `updated`.
- **Screenshots**: project cards currently render a placeholder block instead
  of an image. To wire in real thumbnails, add a `thumbnail` path to the
  `Project` data and swap the placeholder `<div>` in `ProjectCard.tsx` /
  `ProjectDetail.tsx` for an `<img>`.

## Interactivity notes

- **Intro**: a ~1.4s skippable boot sequence, shown once per browser session
  (tracked via `sessionStorage`, see `useUIStore.ts`). It's skipped entirely
  under `prefers-reduced-motion`.
- **Tab transitions**: `SliceTransition` clip-paths the outgoing/incoming
  panel into a diagonal wipe. Falls back to a plain swap (no animation) under
  `prefers-reduced-motion`.
- **Nav**: a vertical blade menu on desktop (`md:` and up, fixed left), a
  bottom tab bar on mobile — both driven by the same `TABS` list and
  Zustand state, so there's one source of truth for the active tab. Keyboard
  users can arrow through tabs (Left/Up, Right/Down, Home/End) via
  `useArrowKeyTabNav`.
- **Reduced motion**: respected in three places — the global CSS fallback in
  `index.css`, the intro sequence, and the background stripe animation.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run lint      # eslint
```
