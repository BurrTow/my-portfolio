import { motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUIStore, type TabId } from "@/store/useUIStore";
import { usePerfStore } from "@/store/usePerfStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FOCUS_RING } from "@/components/ui/buttonStyles";
import { SNAP } from "@/theme/motion";
import { MAP_EDGES, MAP_NODES, nodeById, nodeInDirection } from "@/features/map/mapNodes";

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
  ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
};

export function MapScreen({ onClose }: { onClose: () => void }) {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const animatedSprite = usePerfStore((s) => s.animatedSprite);
  const reducedMotion = usePrefersReducedMotion();

  const [cursor, setCursor] = useState<TabId>(activeTab);
  const areaRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Node coordinates are percentages, but the sprite is moved with a transform
  // rather than left/top — animating those would trigger layout every frame.
  // That means resolving percentages to pixels, which needs the live box.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const commit = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      onClose();
    },
    [setActiveTab, onClose],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        return commit(cursor);
      }
      const dir = KEY_DIRECTIONS[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = nodeInDirection(cursor, dir[0], dir[1]);
      if (next) setCursor(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, commit, onClose]);

  const px = (n: { x: number; y: number }) => ({
    x: (n.x / 100) * size.w,
    y: (n.y / 100) * size.h,
  });
  const spritePos = px(nodeById(cursor));
  const instant = !animatedSprite || reducedMotion;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Map navigation"
      className="fixed inset-0 z-30 flex flex-col bg-p3-black p-4 sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="-skew-x-6 font-display text-2xl font-bold text-p3-white">
            Map
          </h2>
          <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/50">
            Arrows or WASD to move · Enter to travel · Esc to close
          </p>
        </div>
        <button
          onClick={onClose}
          className={`clip-notch bg-p3-blue-deep px-4 py-2 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white hover:bg-p3-blue ${FOCUS_RING}`}
        >
          Close
        </button>
      </div>

      <div
        ref={areaRef}
        className="notched relative flex-1 [--fill:theme(colors.p3-black.panel)]"
      >
        {/* Paths. Non-interactive, so the nodes above stay clickable. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {MAP_EDGES.map(([a, b]) => {
            const from = nodeById(a);
            const to = nodeById(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#2B6FFF" strokeOpacity="0.35"
                strokeWidth="0.4" strokeDasharray="2 1.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {size.w > 0 && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10"
            animate={{ x: spritePos.x, y: spritePos.y }}
            transition={instant ? { duration: 0 } : SNAP}
          >
            {/* An outline that frames the node rather than a filled shape on
                top of it — the selector should not hide what it is selecting. */}
            <span className="block h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-p3-red" />
          </motion.div>
        )}

        {MAP_NODES.map((node) => {
          const isCursor = node.id === cursor;
          const isActive = node.id === activeTab;
          return (
            <button
              key={node.id}
              onClick={() => commit(node.id)}
              onFocus={() => setCursor(node.id)}
              aria-current={isActive ? "page" : undefined}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-none p-2 transition-colors duration-150 ${FOCUS_RING}`}
            >
              <span
                className={`clip-notch flex h-12 w-12 items-center justify-center border text-lg transition-colors duration-150 ${
                  isCursor
                    ? "border-p3-red bg-p3-blue-deep text-p3-white"
                    : "border-p3-blue/60 bg-p3-black-panel text-p3-white/70"
                }`}
              >
                {node.icon}
              </span>
              <span
                className={`font-ui text-xs font-semibold uppercase tracking-wide ${
                  isCursor ? "text-p3-white" : "text-p3-white/60"
                }`}
              >
                {node.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
