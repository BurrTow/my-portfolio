import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { DemoImage, Project, ProjectDemo } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { FOCUS_RING } from "@/components/ui/buttonStyles";
import { usePerfStore } from "@/store/usePerfStore";

/** GSAP is loaded on demand, so its type comes from the dynamic import. */
type Gsap = typeof import("gsap").gsap;

/** Fraction of the frame a drag must cross to count as a swipe. */
const SWIPE_RATIO = 0.2;
const SLIDE_SEC = 0.45;
const SLIDE_EASE = "power3.out";

/**
 * Diagonal reveal for the incoming frame, in the site's cut-corner language.
 * High tier only — clip-path is a paint operation, unlike the transform and
 * opacity the rest of the transition uses.
 */
const CLIP_HIDDEN = "polygon(0 0, 0 0, -30% 100%, -30% 100%)";
const CLIP_SHOWN = "polygon(-2% -2%, 132% -2%, 102% 102%, -2% 102%)";

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
function ImageDemo({ images, title }: { images?: DemoImage[]; title: string }) {
  // Frames that 404 are dropped as they fail. Nothing is probed up front.
  const [broken, setBroken] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [gsap, setGsap] = useState<Gsap | null>(null);
  const highTier = usePerfStore((s) => s.tier === "high");

  const frameRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const ctxRef = useRef<ReturnType<Gsap["context"]> | null>(null);
  /** Flipped by gsap.matchMedia; false means swap with no tween at all. */
  const animateRef = useRef(true);
  const prevIndexRef = useRef(0);
  const dirRef = useRef(1);
  const dragRef = useRef({ startX: 0, dragging: false, width: 1 });

  // Loaded on first mount of the carousel, so GSAP stays out of the entry chunk.
  useEffect(() => {
    let alive = true;
    void import("gsap").then((m) => alive && setGsap(() => m.gsap));
    return () => {
      alive = false;
    };
  }, []);

  const usable = (images ?? []).filter((im) => !broken.includes(im.src));
  const count = usable.length;
  const i = Math.min(index, Math.max(count - 1, 0));

  useEffect(() => {
    if (!gsap) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        animateRef.current = false;
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        animateRef.current = true;
      });
    }, frameRef);
    ctxRef.current = ctx;
    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
  }, [gsap]);

  // Layout effect so the first paint of the stack already has one slide up.
  useLayoutEffect(() => {
    if (!gsap || count === 0) return;
    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    const to = slideRefs.current[i];
    const from =
      prevIndexRef.current !== i ? slideRefs.current[prevIndexRef.current] : null;
    const dir = dirRef.current;
    prevIndexRef.current = i;

    ctxRef.current?.add(() => {
      const settle = () => {
        // x as well as xPercent: a slide dragged by a finger carries a pixel
        // offset that the percentage tween does not cancel.
        gsap.set(
          slides.filter((el) => el !== to),
          { autoAlpha: 0, x: 0, xPercent: 0, clearProps: "clipPath" },
        );
        gsap.set(to, {
          autoAlpha: 1,
          x: 0,
          xPercent: 0,
          scale: 1,
          clearProps: "clipPath",
        });
      };

      if (!animateRef.current) return settle();

      if (from) {
        gsap.to(from, {
          xPercent: -100 * dir,
          autoAlpha: 0,
          duration: SLIDE_SEC,
          ease: SLIDE_EASE,
          overwrite: "auto",
        });
      }
      gsap.fromTo(
        to,
        {
          xPercent: from ? 100 * dir : 0,
          autoAlpha: from ? 0 : 1,
          scale: from ? 1.03 : 1,
          ...(highTier && from ? { clipPath: CLIP_HIDDEN } : null),
        },
        {
          xPercent: 0,
          autoAlpha: 1,
          scale: 1,
          ...(highTier && from ? { clipPath: CLIP_SHOWN } : null),
          duration: SLIDE_SEC,
          ease: SLIDE_EASE,
          overwrite: "auto",
          // Rapid clicks can leave an interrupted slide part-faded; this
          // guarantees exactly one visible frame once the last tween lands.
          onComplete: settle,
        },
      );
      if (captionRef.current && from) {
        gsap.fromTo(
          captionRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: SLIDE_SEC * 0.6, overwrite: "auto" },
        );
      }
    });
  }, [gsap, i, count, highTier]);

  if (count === 0) {
    return <ComingSoon hint="Screenshots of this build are being captured." />;
  }

  const current = usable[i];
  const go = (delta: number) => {
    dirRef.current = delta >= 0 ? 1 : -1;
    setIndex((n) => (Math.min(n, count - 1) + delta + count) % count);
  };
  const goTo = (n: number) => {
    dirRef.current = n > i ? 1 : -1;
    setIndex(n);
  };
  // Keep the neighbours in the DOM so a switch never lands on an empty frame.
  const near = (n: number) =>
    n === i || n === (i + 1) % count || n === (i - 1 + count) % count;

  return (
    <div>
      <div
        ref={frameRef}
        role="group"
        aria-label={`${title} screenshots`}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          go(e.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={(e) => {
          if (!gsap || !animateRef.current || count < 2) return;
          // No setPointerCapture: touch pointers are implicitly captured to
          // their target already, and asking again broke the event sequence.
          dragRef.current = {
            startX: e.clientX,
            dragging: true,
            width: e.currentTarget.clientWidth || 1,
          };
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d.dragging || !gsap) return;
          const el = slideRefs.current[i];
          if (el) gsap.set(el, { x: e.clientX - d.startX, overwrite: "auto" });
        }}
        onPointerCancel={() => {
          dragRef.current.dragging = false;
        }}
        onPointerUp={(e) => {
          const d = dragRef.current;
          if (!d.dragging || !gsap) return;
          d.dragging = false;
          const dx = e.clientX - d.startX;
          const el = slideRefs.current[i];
          if (Math.abs(dx) > d.width * SWIPE_RATIO) return go(dx < 0 ? 1 : -1);
          // Under the threshold: spring the frame back where it was.
          if (el)
            gsap.to(el, { x: 0, duration: 0.25, ease: SLIDE_EASE, overwrite: "auto" });
        }}
        className={`notched relative aspect-video overflow-hidden [--fill:theme(colors.p3-black.panel)] ${FOCUS_RING}`}
      >
        {gsap ? (
          // Stacked in one fixed frame, so switching never reflows anything.
          // No React-controlled opacity or transform here: GSAP owns those, and
          // a re-render would otherwise clobber a tween mid-flight.
          usable.map((im, n) => (
            <div
              key={im.src}
              ref={(el) => {
                slideRefs.current[n] = el;
              }}
              className={`absolute inset-0 ${n === i ? "" : "pointer-events-none"}`}
              style={n === 0 ? undefined : { visibility: "hidden", opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label={`View screenshot ${n + 1} of ${count} full size`}
                tabIndex={n === i ? 0 : -1}
                className="block h-full w-full"
              >
                {near(n) && (
                  <img
                    src={im.src}
                    alt={im.alt}
                    width={1600}
                    height={900}
                    draggable={false}
                    loading={n === 0 ? "eager" : "lazy"}
                    onError={() => setBroken((b) => [...b, im.src])}
                    className="h-full w-full select-none object-contain"
                  />
                )}
              </button>
            </div>
          ))
        ) : (
          // Pre-GSAP (and if the import ever fails): a plain, working carousel.
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={`View screenshot ${i + 1} of ${count} full size`}
            className="block h-full w-full"
          >
            <img
              src={current.src}
              alt={current.alt}
              width={1600}
              height={900}
              loading={i === 0 ? "eager" : "lazy"}
              onError={() => setBroken((b) => [...b, current.src])}
              className="h-full w-full object-contain"
            />
          </button>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className={`clip-notch absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-p3-black/85 px-3 py-2 font-ui text-sm font-semibold text-p3-white hover:bg-p3-blue-deep ${FOCUS_RING}`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className={`clip-notch absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-p3-black/85 px-3 py-2 font-ui text-sm font-semibold text-p3-white hover:bg-p3-blue-deep ${FOCUS_RING}`}
            >
              →
            </button>
          </>
        )}
      </div>

      <p
        ref={captionRef}
        aria-live="polite"
        className="mt-3 font-ui text-sm text-p3-white/70"
      >
        {current.caption}
      </p>

      {count > 1 && (
        <div className="mt-2 flex items-center gap-2">
          {usable.map((im, n) => (
            <button
              key={im.src}
              type="button"
              onClick={() => goTo(n)}
              aria-label={`Go to screenshot ${n + 1}`}
              aria-current={n === i}
              className={`h-2 w-6 -skew-x-12 transition-colors ${FOCUS_RING} ${
                n === i ? "bg-p3-blue" : "bg-p3-white/20"
              }`}
            />
          ))}
          <span className="ml-auto font-ui text-xs uppercase tracking-wide text-p3-white/40">
            {i + 1} / {count}
          </span>
        </div>
      )}

      {zoomed && (
        <ImageLightbox
          src={current.src}
          alt={current.alt}
          title={title}
          subtitle={current.caption}
          footnote={`${i + 1} / ${count}`}
          onClose={() => setZoomed(false)}
          onNavigate={count > 1 ? go : undefined}
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
