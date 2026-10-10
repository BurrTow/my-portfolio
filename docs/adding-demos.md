# Adding demos

A demo is an optional block on a project in
[`src/data/projects.ts`](../src/data/projects.ts). Projects without one render
no demo section at all.

The component is
[`src/features/projects/DemoPanel.tsx`](../src/features/projects/DemoPanel.tsx).
Its shape is defined by `ProjectDemo` in
[`src/types/content.ts`](../src/types/content.ts).

## The three types

### `live` — frame the running app

```ts
demo: { type: "live", url: "https://burrtow.github.io/subnetct/" }
```

Renders a **Launch demo** button. The `<iframe>` is not in the DOM until that
button is pressed — a third-party page pulls its own scripts and fonts, and
nobody opening a project detail has agreed to that yet. An **Open in new tab**
link sits below it and always works, which matters because a site can refuse to
be framed via `X-Frame-Options` or CSP and you cannot detect that from outside.

The frame is sandboxed to `allow-scripts allow-same-origin allow-popups
allow-forms`. `allow-same-origin` is only safe because the framed page is on a
*different* origin — never point this at a URL on your own domain while scripts
are allowed.

Use for: anything already hosted.

### `video` — a recorded walkthrough

```ts
demo: { type: "video", url: "/demos/gastok.mp4", poster: "/demos/gastok-poster.jpg" }
```

Renders a `<video controls preload="none" poster=…>`. Nothing but the poster is
fetched until the play control is used.

**The poster doubles as the existence check.** With preload off the browser
never requests the clip, so a missing `.mp4` cannot report itself until someone
presses play. The panel probes the poster instead, which lets the placeholder
appear immediately. Practical consequence: **ship the poster and the video
together** — a video with no poster beside it shows "Demo coming soon".

Use for: mobile and desktop apps, anything that cannot be framed.

### `images` — a screenshot carousel

```ts
demo: {
  type: "images",
  images: ["/demos/chelsys/01.png", "/demos/chelsys/02.png", "/demos/chelsys/03.png"],
}
```

Prev/next buttons, Left/Right once the strip has focus, and horizontal swipe on
touch. Clicking a frame opens it full size in the shared lightbox.

Unlike the other two this *does* fetch on mount — the images are the content,
and probing them is what makes the missing-file state possible. Unreadable
frames are dropped, so a half-delivered set shows the images that exist rather
than gaps. If none load, the panel shows "Demo coming soon".

Use for: desktop apps, or anything where a video would be overkill.

## File naming and layout

Everything lives under `public/demos/`. Paths in the data file are absolute from
the site root, so `public/demos/x.mp4` is written as `/demos/x.mp4`.

```
public/demos/
  gastok.mp4             <project>.mp4
  gastok-poster.jpg      <project>-poster.jpg
  chelsys/               one folder per screenshot set
    01.png  02.png  03.png
```

Use lowercase, hyphenated names matching the project. Number screenshots
zero-padded (`01`, `02`) so they sort correctly.

## Recommended formats

**Video**

| | |
| --- | --- |
| Codec | H.264 (MP4) — the only format safe to assume everywhere |
| Resolution | 720p. 1080p is wasted at the size this renders |
| Size | **under ~15 MB.** `public/` ships uncompressed and unprocessed |
| Length | 30–60s. Show the one thing the project does well |
| Audio | Strip it. The player is small and nobody expects sound |

```bash
ffmpeg -i raw.mov -vf scale=-2:720 -c:v libx264 -crf 24 -preset slow -an demo.mp4
ffmpeg -i demo.mp4 -ss 00:00:02 -frames:v 1 -q:v 3 demo-poster.jpg
```

**Screenshots**

| | |
| --- | --- |
| Aspect | 16:9, consistent across the set — the carousel is a fixed frame |
| Count | 3–6. Fewer reads as thin, more than six nobody clicks through |
| Format | WebP or PNG. WebP is dramatically smaller for UI screenshots |
| Size | Target under ~200 KB each |

```bash
magick shot.png -resize 1600x -quality 85 01.webp
```

If you switch to `.webp`, update the paths in `projects.ts` to match.

## Swapping in real files

1. Drop the files into `public/demos/` following the layout above.
2. Check the paths in `src/data/projects.ts` match exactly, including extension.
3. `npm run dev`, open the project, confirm the placeholder is gone.

No component changes are needed — the panel switches from placeholder to real
media purely on the files being reachable.

## Before you record

`public/` is published verbatim and permanently. Before recording anything:

- Sign out of personal accounts, or use a throwaway one.
- Use seeded or fake data — no real customer names, emails, phone numbers, or
  transaction amounts.
- Close other tabs, chat apps and notifications; they show up in screen
  recordings more often than people expect.
- Check the window title bar and URL for anything identifying.
- Watch the recording back before committing it.

A file committed once stays in git history even if deleted later.
