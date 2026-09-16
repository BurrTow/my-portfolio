import { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore, type TabId } from "@/store/useUIStore";
import { usePerfStore } from "@/store/usePerfStore";
import { FOCUS_RING } from "@/components/ui/buttonStyles";
import { MAP_PINS } from "@/features/map/mapNodes";
import { CityscapeBackdrop } from "@/features/map/CityscapeBackdrop";

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
 */
export function MapScreen({ onClose }: { onClose: () => void }) {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const mapBackdrop = usePerfStore((s) => s.mapBackdrop);
  const [selected, setSelected] = useState<TabId>(activeTab);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Low tier keeps the same component and drops only the backdrop, so the
  // list is never a different, lesser screen — it is this screen, full width.
  const showBackdrop = mapBackdrop;

  /** Confirming sets the tab, which is what the existing wipe listens to. */
  const confirm = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      onClose();
    },
    [setActiveTab, onClose],
  );

  // Clicking selects; clicking the already-selected entry confirms it. Same
  // rule for pins and list rows, so the two controls behave identically.
  const choose = useCallback(
    (id: TabId) => (id === selected ? confirm(id) : setSelected(id)),
    [selected, confirm],
  );

  // Move focus into the dialog so keys land here and screen readers follow.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        return onClose();
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
  }, [selected, confirm, onClose]);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Select destination"
      className="fixed inset-0 z-30 flex flex-col bg-p3-black p-4 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="-skew-x-6 font-display text-2xl font-bold text-p3-white">
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* Sidebar — primary control, always present */}
        {/* Without a backdrop the list is the whole screen, not a column with
            dead space beside it. */}
        <ul
          className={`flex flex-col gap-2 ${
            showBackdrop ? "shrink-0 lg:w-64" : "w-full"
          }`}
        >
          {MAP_PINS.map((pin) => {
            const isSel = pin.id === selected;
            return (
              <li key={pin.id}>
                <button
                  onClick={() => choose(pin.id)}
                  onMouseEnter={() => setSelected(pin.id)}
                  onFocus={() => setSelected(pin.id)}
                  aria-current={pin.id === activeTab ? "page" : undefined}
                  className={`notched flex w-full items-center gap-3 px-4 py-3 text-left font-ui text-sm font-semibold uppercase tracking-wide transition-colors duration-150 ${FOCUS_RING} ${
                    isSel
                      ? "text-p3-white [--edge:theme(colors.p3-red.DEFAULT)] [--fill:theme(colors.p3-blue.deep)]"
                      : "text-p3-white/70 [--fill:theme(colors.p3-black.panel)]"
                  }`}
                >
                  <span className="text-base">{pin.icon}</span>
                  {pin.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Backdrop + pins */}
        {showBackdrop && (
          <div className="notched relative min-h-[18rem] flex-1 overflow-hidden [--fill:theme(colors.p3-black.panel)]">
            <CityscapeBackdrop />
            {MAP_PINS.map((pin) => {
              const isSel = pin.id === selected;
              return (
                <button
                  key={pin.id}
                  onClick={() => choose(pin.id)}
                  onMouseEnter={() => setSelected(pin.id)}
                  onFocus={() => setSelected(pin.id)}
                  aria-label={pin.label}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 p-1 ${FOCUS_RING}`}
                >
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 font-ui text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                      isSel
                        ? "bg-p3-red text-p3-white"
                        : "bg-p3-black/85 text-p3-white/80"
                    }`}
                  >
                    {pin.label}
                  </span>
                  <span
                    className={`flex h-8 w-8 rotate-45 items-center justify-center border-2 transition-colors duration-150 ${
                      isSel
                        ? "border-p3-red bg-p3-blue-deep"
                        : "border-p3-blue/70 bg-p3-black"
                    }`}
                  >
                    <span className="-rotate-45 text-xs text-p3-white">
                      {pin.icon}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-p3-blue/25 pt-3">
        <p className="font-ui text-xs uppercase tracking-wide text-p3-white/50">
          <span className="text-p3-white/80">↑↓</span> Select ·{" "}
          <span className="text-p3-white/80">Enter</span> Travel ·{" "}
          <span className="text-p3-white/80">Esc</span> Close
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`notched px-4 py-2 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white [--fill:theme(colors.p3-black.panel)] ${FOCUS_RING}`}
          >
            Close
          </button>
          <button
            onClick={() => confirm(selected)}
            className={`clip-notch bg-p3-blue-deep px-5 py-2 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white hover:bg-p3-blue ${FOCUS_RING}`}
          >
            Travel
          </button>
        </div>
      </div>
    </div>
  );
}
