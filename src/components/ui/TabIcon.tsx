import type { ReactNode } from "react";
import type { TabId } from "@/store/useUIStore";

/**
 * One glyph per destination, shared by the nav and the map.
 *
 * Inline SVG rather than an icon package: it is five shapes, and they follow
 * the angular vocabulary the rest of the site is drawn in (45° cuts, skewed
 * bars) which no general-purpose set would match. A dependency would also ship
 * a whole font or component library to render five paths.
 *
 * Stroked in currentColor so each row's existing colour transition drives the
 * icon too, with no second colour rule to keep in sync.
 */
const PATHS: Record<TabId, ReactNode> = {
  // Layered diamonds, echoing the site's 45° cuts.
  projects: (
    <>
      <path d="M12 2 L22 12 L12 22 L2 12 Z" />
      <path d="M12 7 L17 12 L12 17 L7 12 Z" />
    </>
  ),
  // A seal with ribbon tails.
  certificates: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 6 L14 9 L12 12 L10 9 Z" />
      <path d="M8.5 14 L8.5 22 L12 19 L15.5 22 L15.5 14" />
    </>
  ),
  // Hexagon with a centre node.
  repos: (
    <>
      <path d="M12 2 L20.5 7 L20.5 17 L12 22 L3.5 17 L3.5 7 Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  // A sheet with the same notched corner as .clip-notch.
  resume: (
    <>
      <path d="M4.5 2 H14.5 L19.5 7 V22 H4.5 Z" />
      <path d="M14.5 2 V7 H19.5" />
      <path d="M8 11.5 H16" />
      <path d="M8 15.5 H16" />
      <path d="M8 19 H13" />
    </>
  ),
  // Head and shoulders.
  about: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5 C5 16 8 14 12 14 C16 14 19 16 19 20.5" />
    </>
  ),
};

export function TabIcon({ id, className }: { id: TabId; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      className={className}
    >
      {PATHS[id]}
    </svg>
  );
}
