# Portfolio

A personal portfolio built as a Persona 3 Reload–styled menu interface: a title
screen, a map you pick a destination from, and five content tabs behind it.

Everything on the site is driven by typed data files — there is no CMS and no
hardcoded content in components. Adding a project or a certificate means editing
one array.

**Live:** _not deployed yet — replace this line with the URL once it is._

## Tech stack

| | |
| --- | --- |
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3, with custom cut-corner utilities |
| Animation | Framer Motion — [the only animation library, deliberately](docs/adr/0001-framer-motion-only.md) |
| State | Zustand (two small stores) |
| Lint | ESLint 9 + typescript-eslint |

## Setup

Requires Node 18+.

```bash
npm ci          # install exactly what the lockfile pins
npm run dev     # http://localhost:5173
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` then `vite build` — typecheck is part of the build |
| `npm run lint` | ESLint over the repo |
| `npm run preview` | Serve the production build locally |

`postinstall` points `core.hooksPath` at `.githooks/`, which installs a
`commit-msg` hook. There is no test suite yet; `npm run build` is the gate.

## Folder structure

```
src/
  components/
    layout/        Shell, Nav, BackgroundFX
    transitions/   IntroSequence, IntroExit, MaskWipe, SliceTransition
    ui/            Shared primitives (Card, Button, TabIcon, ImageLightbox…)
  data/            All site content — see "Adding content"
  features/        One folder per tab, plus map/
  hooks/           Device tier, frame monitor, reduced motion, arrow-key nav
  store/           useUIStore (navigation), usePerfStore (capability flags)
  theme/           motion.ts and introMotion.ts — two separate motion systems
  types/content.ts Shared content types
public/
  certificates/    Certificate scans (.webp)
  demos/           Project demo media — see docs/adding-demos.md
```

Further reading: [architecture](docs/architecture.md) ·
[performance](docs/performance.md) · [adding demos](docs/adding-demos.md) ·
[decision records](docs/adr/)

## Adding content

All content lives in `src/data/`. Types are in
[`src/types/content.ts`](src/types/content.ts); the compiler will tell you what
a given entry is missing.

### A project

Append to `projects` in `src/data/projects.ts`:

```ts
{
  id: "my-project",
  title: "My Project",
  description: "One or two sentences.",
  tech: ["TypeScript", "Vite"],
  repo: "https://github.com/you/my-project",   // omit → "Repo coming soon"
  teamSize: 3,                                  // omit for solo work
  repoOwnedByOther: true,                       // repo under a teammate's account
}
```

`teamSize` and `repoOwnedByOther` drive the credit line under the card, so
staffing and repo ownership are stated up front rather than inferred from a URL.

### A certificate

Append to `certificates` in `src/data/certificates.ts`:

```ts
{
  id: "cisco-intro-networks",
  name: "CCNA: Introduction to Networks",
  issuer: "Cisco Networking Academy",
  date: "January 20, 2026",
  credentialId: "111735458",                    // optional
  image: "/certificates/ccna-itn.webp",         // optional
}
```

With `image` set the card opens a full-size lightbox. Without it the card is
inert — no click target, so a missing file can never open an empty modal. Put
the file in `public/certificates/` and export WebP at ~1600px wide.

### A repo link

Append to `repoLinks` in `src/data/links.ts`. The Repos tab shows a
"coming soon" empty state while the array is empty, which is its current state.

### A demo

Add a `demo` block to a project. Full guide: [adding demos](docs/adding-demos.md).

```ts
demo: { type: "live",   url: "https://example.github.io/app/" }
demo: { type: "video",  url: "/demos/app.mp4", poster: "/demos/app-poster.jpg" }
demo: { type: "images", images: ["/demos/app/01.png", "/demos/app/02.png"] }
```

Media is loaded on demand and a missing file renders "Demo coming soon" rather
than a broken frame, so you can wire a demo up before the recording exists.

## Deploying

`npm run build` emits a fully static `dist/`. There is no server component and
no environment configuration, so any static host works — GitHub Pages, Netlify,
Cloudflare Pages.

Two things to know before the first deploy:

- **Base path.** If you host under a subpath (e.g. `user.github.io/portfolio/`),
  set `base` in `vite.config.ts`. At a domain root no change is needed.
- **`public/` ships verbatim.** Certificate scans carry your full name and
  credential numbers, and demo recordings may show real data. Both become
  permanently public. See the warning in
  [adding demos](docs/adding-demos.md#before-you-record).

## Performance tiering

The site measures the device instead of assuming. A cheap static guess runs
first (`useDeviceTier`), then `useFrameMonitor` samples real frame times for a
few seconds and downgrades if the device is not keeping up — dropping the
drifting backdrop first, then the map illustration. Navigation is never gated;
only decoration comes off.

One regression class has bitten this project repeatedly: **a translucent
full-viewport layer animating over other animating content**. Overlays here are
opaque for that reason. Details and the 6× CPU throttle test procedure are in
[performance](docs/performance.md).
