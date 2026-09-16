import type { TabId } from "@/store/useUIStore";

export interface MapPin {
  id: TabId;
  label: string;
  icon: string;
  /** Percentage of the backdrop. Art-directed for balance, not geography. */
  x: number;
  y: number;
}

/**
 * Spread across the frame so no corner reads empty and no two pins collide
 * with each other's label callouts. Positions are arbitrary by design — the
 * backdrop is decorative, so nothing here maps to a real place.
 */
export const MAP_PINS: MapPin[] = [
  { id: "projects", label: "Projects", icon: "◈", x: 20, y: 40 },
  { id: "certificates", label: "Certificates", icon: "❖", x: 44, y: 22 },
  { id: "repos", label: "Repos", icon: "⬡", x: 70, y: 36 },
  { id: "resume", label: "Resume", icon: "▤", x: 80, y: 66 },
  { id: "about", label: "About", icon: "◉", x: 36, y: 70 },
];

export const pinById = (id: TabId) =>
  MAP_PINS.find((p) => p.id === id) ?? MAP_PINS[0];
