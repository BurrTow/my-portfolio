import {
  motion,
  useMotionValue,
  useSpring,
  type AnimationDefinition,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useUIStore, type TabId } from "@/store/useUIStore";
import { usePerfStore } from "@/store/usePerfStore";
import { FOCUS_RING } from "@/components/ui/buttonStyles";
import { MAP_PINS, pinById } from "@/features/map/mapNodes";
import {
  CityscapeBackdrop,
  type DepthMode,
} from "@/features/map/CityscapeBackdrop";
import { MapDetail } from "@/features/map/MapDetail";
import { TabIcon } from "@/components/ui/TabIcon";
import { mapScreenVariants } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** How far the map zooms toward the chosen pin before handing over. */
const TRAVEL_SCALE = 1.6;
const TRAVEL_SEC = 0.28;

/** Rounded key cap and its action, replacing the plain-text prompt line. */
function KeyHint({ glyph, label }: { glyph: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="inline-flex h-6 min-w-[1.9rem] items-center justify-center rounded-full border border-p3-blue/50 bg-p3-black-raised px-2 font-ui text-[0.7rem] font-bold leading-none text-p3-white">
        {glyph}
      </span>
      <span className="font-ui text-xs uppercase tracking-wide text-p3-white/55">
        {label}
      </span>
    </span>
  );
}

/**
 * Pin-select map: a static backdrop with location pins, mirrored by a sidebar
 * list. Selection is highlight-then-confirm — nothing travels across the map.
 *
 * The sidebar is the primary control, not a fallback. It carries the same
 * selection state as the pins and works unchanged if the backdrop fails to
 * load or is switched off on a low tier, so navigation never depends on an
 * image arriving.
 *
 * The overlay is opaque. A translucent full-viewport layer over the animating
 * backdrop was what halved frame rate in the previous map build.
 *
 * The exit animation runs here rather than through an AnimatePresence in the
 * caller, and `onClose` is only called once it finishes. That ordering is what
 * keeps the drifting backdrop frozen: BackgroundFX pauses on `mapOpen`, and
 * handing that flag back at the start of the exit would restart the drift under
 * a screen that is still moving — the exact pairing this project keeps paying
 * for. It also leaves App.tsx untouched.
 */
export function MapScreen({ onClose }: { onClose: () => void }) {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const mapBackdrop = usePerfStore((s) => s.mapBackdrop);
  const tier = usePerfStore((s) => s.tier);
  const [selected, setSelected] = useState<TabId>(activeTab);
  const [closing, setClosing] = useState(false);
  const [traveling, setTraveling] = useState(false);
  const [travelId, setTravelId] = useState<TabId | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Mouse-first: a fine pointer gets hover affordances and click-to-travel.
  // Touch keeps select-then-confirm, because there is no hover to preview with.
  const [finePointer, setFinePointer] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setFinePointer(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const transitioning = closing || traveling;
  // low tier and reduced motion drop to an instant swap; medium keeps hover and
  // the travel zoom but not the parallax; high gets everything.
  const instantNav = reducedMotion || tier === "low";
  const hoverFx = !instantNav && finePointer;
  /**
   * high gets the perspective stack and tilt, medium the depth shift alone,
   * and low or reduced motion a still render — the painted depth stays either
   * way. Reading `tier` from the store means a live downgrade from the frame
   * monitor takes effect while the map is open.
   */
  const depthMode: DepthMode =
    instantNav || !finePointer ? "static" : tier === "high" ? "3d" : "shift";
  const parallax = depthMode !== "static";

  // Pointer offset from the map's centre, -1..1 on each axis. Motion values so
  // moving the mouse never re-renders this component.
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const spring = { stiffness: 120, damping: 20, mass: 0.4 };
  const px = useSpring(pxRaw, spring);
  const py = useSpring(pyRaw, spring);
  const rafRef = useRef(0);
  // Measured on enter, not per move: a layout read inside a pointermove
  // handler is the thing that makes this kind of effect expensive.
  const rectRef = useRef<DOMRect | null>(null);

  const restParallax = useCallback(() => {
    pxRaw.set(0);
    pyRaw.set(0);
  }, [pxRaw, pyRaw]);

  // Park the pointer values whenever nothing should be reacting to them: a
  // transition in flight, or a tier that has just been downgraded under us.
  useEffect(() => {
    if (transitioning || !parallax) restParallax();
  }, [transitioning, parallax, restParallax]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!parallax || transitioning) return;
      const r = rectRef.current;
      if (!r) return;
      // Coalesce to one update per frame; the rect is already cached, so the
      // handler itself only reads the event.
      const { clientX, clientY } = e;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        pxRaw.set(((clientX - r.left) / r.width - 0.5) * 2);
        pyRaw.set(((clientY - r.top) / r.height - 0.5) * 2);
      });
    },
    [parallax, transitioning, pxRaw, pyRaw],
  );
  // Held across the exit so a confirmed destination is applied as the screen
  // finishes leaving, rather than while it is still on its way out.
  const pendingRef = useRef<(() => void) | null>(null);

  /**
   * Plays the exit, then performs the action. Reduced motion skips straight to
   * the action, so the screen cuts rather than hurrying.
   */
  const requestClose = useCallback(
    (after?: () => void) => {
      if (closing) return;
      if (reducedMotion) {
        after?.();
        onClose();
        return;
      }
      pendingRef.current = after ?? null;
      setClosing(true);
    },
    [closing, reducedMotion, onClose],
  );

  const handleAnimationComplete = useCallback(
    (definition: AnimationDefinition) => {
      if (definition !== "exit" && definition !== "travel") return;
      pendingRef.current?.();
      pendingRef.current = null;
      onClose();
    },
    [onClose],
  );

  // Low tier keeps the same component and drops only the backdrop, so the
  // list is never a different, lesser screen — it is this screen, full width.
  const showBackdrop = mapBackdrop;

  /**
   * Confirming sets the tab, which is what the existing wipe listens to. The
   * tab only changes once the map has left, so the wipe plays after this
   * screen rather than underneath it — two full-viewport animations at once is
   * exactly the kind of overlap worth avoiding here.
   */
  const confirm = useCallback(
    (id: TabId) => {
      if (transitioning) return;
      if (instantNav) {
        setActiveTab(id);
        onClose();
        return;
      }
      // Swap the destination now, while the opaque map still covers it, so the
      // old page is never on screen during the hand-off. MaskWipe is already
      // listening on navSeq and takes it from here.
      setActiveTab(id);
      setTravelId(id);
      setTraveling(true);
    },
    [transitioning, instantNav, setActiveTab, onClose],
  );

  // Clicking selects; clicking the already-selected entry confirms it. Same
  // rule for pins and list rows, so the two controls behave identically.
  const choose = useCallback(
    (id: TabId) => (id === selected ? confirm(id) : setSelected(id)),
    [selected, confirm],
  );

  /** Pins only: with a mouse, one click is the whole gesture. */
  const choosePin = useCallback(
    (id: TabId) => (finePointer ? confirm(id) : choose(id)),
    [finePointer, confirm, choose],
  );

  // Move focus into the dialog so keys land here and screen readers follow.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Scrolling the page behind the map is what makes Safari hide its address
  // bar, which resizes this overlay mid-use. Previous values are restored
  // rather than cleared, so an overlay that locked before us keeps its lock.
  // shortcut: iOS can still rubber-band past this; upgrade to a fixed body
  // with a saved scroll offset if that turns out to be visible.
  useEffect(() => {
    const { overflow, overscrollBehavior } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.overscrollBehavior = overscrollBehavior;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        return requestClose();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        return confirm(selected);
      }
      const delta =
        e.key === "ArrowDown" || e.key === "s" || e.key === "S"
          ? 1
          : e.key === "ArrowUp" || e.key === "w" || e.key === "W"
            ? -1
            : 0;
      if (!delta) return;
      e.preventDefault();
      const i = MAP_PINS.findIndex((p) => p.id === selected);
      // Wrap, so holding a direction never dead-ends at the list edge.
      const next = (i + delta + MAP_PINS.length) % MAP_PINS.length;
      setSelected(MAP_PINS[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, confirm, requestClose]);

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Select destination"
      {...(reducedMotion
        ? {}
        : {
            variants: mapScreenVariants,
            initial: "initial" as const,
            animate: traveling
              ? ("travel" as const)
              : closing
                ? ("exit" as const)
                : ("enter" as const),
            onAnimationComplete: handleAnimationComplete,
          })}
      // h-screen is the fallback; dvh tracks Safari's collapsing address bar
      // so the column is never measured against a height the screen lost.
      className={`fixed inset-0 z-30 flex h-screen flex-col overflow-hidden bg-p3-black p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] supports-[height:100dvh]:h-dvh sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] ${
        transitioning ? "pointer-events-none" : ""
      }`}
    >
      <div className="mb-3 flex shrink-0 items-start justify-between gap-4 md:mb-4">
        <div>
          <h2 className="-skew-x-6 font-display text-xl font-bold text-p3-white md:text-2xl">
            Select Map
          </h2>
          <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/50">
            Choose a destination
          </p>
        </div>
        <div className="text-right">
          <p className="font-ui text-xs uppercase tracking-widest text-p3-white/40">
            Status
          </p>
          <p className="font-ui text-sm font-semibold uppercase tracking-wide text-p3-blue">
            Open to opportunities
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4 lg:flex-row">
        {/* Sidebar — primary control, always present */}
        {/* Without a backdrop the list is the whole screen, not a column with
            dead space beside it. Below md it sits under the map, because the
            map is what needs the height. */}
        <div
          className={`flex flex-col gap-3 ${
            showBackdrop ? "order-2 shrink-0 md:order-none lg:w-72" : "w-full"
          }`}
        >
          {/* With a backdrop the list is a swipeable strip below md, so five
              entries cost one row instead of five. Without one it is the only
              control on the screen and stays a full list. */}
          <ul
            className={`flex gap-2 ${
              showBackdrop
                ? "overflow-x-auto md:flex-col md:overflow-x-visible"
                : "flex-col"
            }`}
          >
            {MAP_PINS.map((pin) => {
              const isSel = pin.id === selected;
              return (
                <li
                  key={pin.id}
                  className={showBackdrop ? "shrink-0 md:shrink" : ""}
                >
                  <button
                    onClick={() => choose(pin.id)}
                    // Guarded exactly as the pins are: a touch tap fires the
                    // compatibility mouse events and focuses the button, and
                    // either one pre-selecting would make the first tap
                    // confirm and navigate.
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setSelected(pin.id);
                    }}
                    onFocus={(e) => {
                      if (e.currentTarget.matches(":focus-visible")) {
                        setSelected(pin.id);
                      }
                    }}
                    aria-current={pin.id === activeTab ? "page" : undefined}
                    className={`notched flex w-full items-center gap-2 px-3 py-3 text-left font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 md:gap-3 md:px-4 md:text-sm ${FOCUS_RING} ${
                      isSel
                        ? "text-p3-white [--edge:theme(colors.p3-red.DEFAULT)] [--fill:theme(colors.p3-blue.deep)]"
                        : "text-p3-white/70 [--fill:theme(colors.p3-black.panel)]"
                    }`}
                  >
                    <TabIcon
                      id={pin.id}
                      className="h-4 w-4 shrink-0 md:h-5 md:w-5"
                    />
                    {pin.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <MapDetail selected={selected} />
        </div>

        {/* Backdrop + pins */}
        {showBackdrop && (
          <div
            onPointerEnter={(e) => {
              if (parallax)
                rectRef.current = e.currentTarget.getBoundingClientRect();
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={restParallax}
            // Below md the 18rem floor is what overflowed the column and
            // pushed the HUD off-screen, so the map takes the leftover height
            // instead, with a small floor only to stop it collapsing.
            className="notched relative min-h-[8rem] flex-1 overflow-hidden md:min-h-[18rem] [--fill:theme(colors.p3-black.panel)]"
          >
            <motion.div
              // The zoom has to start from where the pin actually is, which
              // differs by breakpoint, so the origin travels as a variable too.
              className="absolute inset-0 origin-[var(--zoom-from)] md:origin-[var(--zoom-from-md)]"
              style={
                {
                  "--zoom-from": travelId
                    ? `${pinById(travelId).mobileX}% ${pinById(travelId).mobileY}%`
                    : "50% 50%",
                  "--zoom-from-md": travelId
                    ? `${pinById(travelId).x}% ${pinById(travelId).y}%`
                    : "50% 50%",
                } as CSSProperties
              }
              animate={
                traveling
                  ? { scale: TRAVEL_SCALE, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: TRAVEL_SEC, ease: "easeIn" }}
            >
              {/* Pins render on the near plane, so their hit areas ride the
                  same transform as the buildings they sit on. */}
              <CityscapeBackdrop px={px} py={py} mode={depthMode}>
                {MAP_PINS.map((pin) => {
                  const isSel = pin.id === selected;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => choosePin(pin.id)}
                      // pointerenter, not mouseenter: a touch tap fires the
                      // compatibility mouse events too, which would pre-select
                      // the pin and turn the first tap into a confirm.
                      onPointerEnter={(e) => {
                        if (e.pointerType === "mouse") setSelected(pin.id);
                      }}
                      // :focus-visible, not every focus: a tap focuses the pin
                      // too, and pre-selecting it would turn the first tap into
                      // a confirm. Keyboard focus still selects as before.
                      onFocus={(e) => {
                        if (e.currentTarget.matches(":focus-visible")) {
                          setSelected(pin.id);
                        }
                      }}
                      aria-label={pin.label}
                      // Both coordinate sets go in as custom properties and
                      // the breakpoint picks one, so swapping them needs no
                      // width state and cannot disagree with the layout's own
                      // md: rules.
                      style={
                        {
                          "--pin-x": `${pin.mobileX}%`,
                          "--pin-y": `${pin.mobileY}%`,
                          "--pin-x-md": `${pin.x}%`,
                          "--pin-y-md": `${pin.y}%`,
                        } as CSSProperties
                      }
                      className={`group pointer-events-auto absolute left-[var(--pin-x)] top-[var(--pin-y)] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 p-1 md:left-[var(--pin-x-md)] md:top-[var(--pin-y-md)] ${
                        hoverFx ? "cursor-pointer" : ""
                      } ${FOCUS_RING}`}
                    >
                      <span
                        className={`clip-notch whitespace-nowrap px-3 py-1 font-ui text-xs font-semibold uppercase tracking-wide transition-[colors,transform] duration-150 ${
                          hoverFx ? "group-hover:-translate-y-0.5" : ""
                        } ${
                          isSel
                            ? "bg-p3-red text-p3-white"
                            : "bg-p3-black/85 text-p3-white/80"
                        }`}
                      >
                        {pin.label}
                      </span>
                      <span
                        // 44px below md: the minimum comfortable tap target,
                        // and the diamond is the part people aim at.
                        className={`flex h-11 w-11 rotate-45 items-center justify-center border-2 transition-[colors,transform,box-shadow] duration-150 md:h-8 md:w-8 ${
                          hoverFx
                            ? "group-hover:scale-[1.12] group-hover:shadow-[0_0_14px_3px_rgba(43,111,255,0.5)] group-active:scale-95"
                            : ""
                        } ${
                          isSel
                            ? "border-p3-red bg-p3-blue-deep"
                            : "border-p3-blue/70 bg-p3-black"
                        }`}
                      >
                        <TabIcon
                          id={pin.id}
                          className="h-5 w-5 -rotate-45 text-p3-white md:h-4 md:w-4"
                        />
                      </span>
                    </button>
                  );
                })}
              </CityscapeBackdrop>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div className="mt-3 flex shrink-0 items-center justify-between gap-4 border-t border-p3-blue/25 pt-3 md:mt-4">
        {/* Nothing to press these keys with on a touch device. */}
        {finePointer && (
          <div className="flex flex-wrap items-center gap-4">
            <KeyHint glyph="↑↓" label="Select" />
            <KeyHint glyph="Enter" label="Travel" />
            <KeyHint glyph="Esc" label="Close" />
          </div>
        )}
        {/* On touch the hints are gone, so the two buttons split the row
            instead: 44px-tall targets that are always on screen because the
            HUD never shrinks. */}
        <div className={`flex gap-2 ${finePointer ? "" : "flex-1"}`}>
          <button
            onClick={() => requestClose()}
            className={`notched px-4 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white [--fill:theme(colors.p3-black.panel)] ${
              finePointer ? "py-2" : "flex-1 py-3"
            } ${FOCUS_RING}`}
          >
            Close
          </button>
          <button
            onClick={() => confirm(selected)}
            className={`clip-notch bg-p3-blue-deep px-5 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white hover:bg-p3-blue ${
              finePointer ? "py-2" : "flex-1 py-3"
            } ${FOCUS_RING}`}
          >
            Travel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
