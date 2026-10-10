import { useEffect, useRef, useState } from "react";
import type { Project, ProjectDemo } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

/** Horizontal travel, in px, before a touch counts as a swipe rather than a tap. */
const SWIPE_PX = 40;

/**
 * Shown whenever the declared media is absent. Demos are wired up before the
 * recordings exist, so this is a normal state, not an error — a visitor should
 * see a deliberate placeholder rather than a broken frame.
 */
function ComingSoon({ hint }: { hint: string }) {
  return <EmptyState title="Demo coming soon" hint={hint} />;
}

/**
 * Live site in a frame, mounted only once asked for.
 *
 * The iframe is not rendered at all until the button is pressed: a third-party
 * page pulls its own scripts and fonts, and nobody opening a project detail has
 * agreed to that yet. The new-tab link is always available, so the demo is
 * still reachable if the frame is blocked by the site's headers or by an
 * extension.
 */
function LiveDemo({ url, title }: { url?: string; title: string }) {
  const [launched, setLaunched] = useState(false);

  if (!url) {
    return <ComingSoon hint="This project has no hosted build yet." />;
  }

  return (
    <div>
      {launched ? (
        <div className="notched aspect-video overflow-hidden [--fill:theme(colors.p3-black.panel)]">
          <iframe
            src={url}
            title={`${title} live demo`}
            className="h-full w-full border-0"
            // allow-same-origin is safe here only because the framed page is on
            // another origin, so "same origin" means its own, not this site's.
            // Never point this at a same-origin URL with scripts allowed.
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="notched flex aspect-video flex-col items-center justify-center gap-4 [--fill:theme(colors.p3-black.panel)]">
          <Button onClick={() => setLaunched(true)}>Launch demo</Button>
          <p className="max-w-xs px-4 text-center font-ui text-xs uppercase tracking-wide text-p3-white/40">
            Loads the live app in a sandboxed frame
          </p>
        </div>
      )}
      <div className="mt-3">
        <LinkButton
          variant="ghost"
          href={url}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 text-xs"
        >
          Open in new tab ↗
        </LinkButton>
      </div>
    </div>
  );
}

/**
 * Recorded walkthrough, click to play.
 *
 * `preload="none"` means nothing but the poster is fetched until the play
 * control is used, so a detail view costs one image rather than a video.
 *
 * The poster doubles as the existence probe. With preload off the browser
 * never requests the clip, so a missing .mp4 cannot report itself until
 * someone presses play — checking the poster instead lets the placeholder
 * appear immediately, which is the state this sits in until a recording is
 * made.
 */
function VideoDemo({
  url,
  poster,
  title,
}: {
  url?: string;
  poster?: string;
  title: string;
}) {
  const [probe, setProbe] = useState<"checking" | "ready" | "missing">(
    poster ? "checking" : url ? "ready" : "missing",
  );

  useEffect(() => {
    if (!poster) return;
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setProbe("ready");
    img.onerror = () => alive && setProbe("missing");
    img.src = poster;
    return () => {
      alive = false;
    };
  }, [poster]);

  if (!url || probe === "missing") {
    return <ComingSoon hint="A walkthrough recording is being prepared." />;
  }
  if (probe === "checking") {
    return (
      <div
        aria-hidden
        className="notched aspect-video [--fill:theme(colors.p3-black.panel)]"
      />
    );
  }

  return (
    <div className="notched aspect-video overflow-hidden [--fill:theme(colors.p3-black.panel)]">
      <video
        controls
        preload="none"
        poster={poster}
        aria-label={`${title} walkthrough`}
        className="h-full w-full"
        onError={() => setProbe("missing")}
      >
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
}

/**
 * Screenshot carousel.
 *
 * Every frame is probed up front and the unreadable ones are dropped, so a
 * half-delivered set shows the images that exist rather than gaps. Unlike the
 * iframe and the video this does fetch on mount — they are the content here,
 * and the probe is what makes the missing-file state possible.
 *
 * Driven three ways so it works on every input: buttons, Left/Right once the
 * strip has focus, and a horizontal swipe on touch.
 */
function ImageDemo({ images, title }: { images?: string[]; title: string }) {
  const [usable, setUsable] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!images?.length) return setUsable([]);
    let alive = true;
    const results: (string | null)[] = new Array(images.length).fill(null);
    let settled = 0;
    images.forEach((src, i) => {
      const img = new Image();
      const finish = (ok: boolean) => {
        results[i] = ok ? src : null;
        if (++settled === images.length && alive) {
          setUsable(results.filter((s): s is string => s !== null));
        }
      };
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      img.src = src;
    });
    return () => {
      alive = false;
    };
  }, [images]);

  if (usable === null) {
    return (
      <div
        aria-hidden
        className="notched aspect-video [--fill:theme(colors.p3-black.panel)]"
      />
    );
  }
  if (usable.length === 0) {
    return <ComingSoon hint="Screenshots of this build are being captured." />;
  }

  const count = usable.length;
  const step = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div>
      <div
        role="group"
        aria-label={`${title} screenshots`}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          step(e.key === "ArrowRight" ? 1 : -1);
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const from = touchStartX.current;
          touchStartX.current = null;
          if (from === null) return;
          const dx = e.changedTouches[0].clientX - from;
          if (Math.abs(dx) < SWIPE_PX) return;
          step(dx < 0 ? 1 : -1);
        }}
        className={`notched relative aspect-video overflow-hidden [--fill:theme(colors.p3-black.panel)] ${FOCUS_RING}`}
      >
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`View screenshot ${index + 1} of ${count} full size`}
          className="block h-full w-full"
        >
          <img
            src={usable[index]}
            alt={`${title} screenshot ${index + 1} of ${count}`}
            className="h-full w-full object-contain"
          />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous screenshot"
              className={`clip-notch absolute left-2 top-1/2 -translate-y-1/2 bg-p3-black/85 px-3 py-2 font-ui text-sm font-semibold text-p3-white hover:bg-p3-blue-deep ${FOCUS_RING}`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next screenshot"
              className={`clip-notch absolute right-2 top-1/2 -translate-y-1/2 bg-p3-black/85 px-3 py-2 font-ui text-sm font-semibold text-p3-white hover:bg-p3-blue-deep ${FOCUS_RING}`}
            >
              →
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center gap-2">
          {usable.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              aria-current={i === index}
              className={`h-2 w-6 -skew-x-12 ${FOCUS_RING} ${
                i === index ? "bg-p3-blue" : "bg-p3-white/20"
              }`}
            />
          ))}
          <span className="ml-auto font-ui text-xs uppercase tracking-wide text-p3-white/40">
            {index + 1} / {count}
          </span>
        </div>
      )}

      {zoomed && (
        <ImageLightbox
          src={usable[index]}
          alt={`${title} screenshot ${index + 1} of ${count}`}
          title={title}
          subtitle={`Screenshot ${index + 1} of ${count}`}
          onClose={() => setZoomed(false)}
          onNavigate={count > 1 ? step : undefined}
        />
      )}
    </div>
  );
}

/**
 * The demo section of a project's detail view.
 *
 * Renders nothing at all when a project declares no demo, so the detail view
 * is unchanged for projects without one.
 *
 * Deliberately motionless: nothing here animates, so there is no
 * prefers-reduced-motion branch to write. Adding a crossfade purely to switch
 * it off again would be more code and more risk than the effect is worth.
 */
export function DemoPanel({ project }: { project: Project }) {
  const demo: ProjectDemo | undefined = project.demo;
  if (!demo) return null;

  return (
    <section className="mt-8">
      <h4 className="mb-3 font-ui text-xs font-bold uppercase tracking-widest text-p3-blue">
        Demo
      </h4>
      {demo.type === "live" && <LiveDemo url={demo.url} title={project.title} />}
      {demo.type === "video" && (
        <VideoDemo url={demo.url} poster={demo.poster} title={project.title} />
      )}
      {demo.type === "images" && (
        <ImageDemo images={demo.images} title={project.title} />
      )}
    </section>
  );
}
