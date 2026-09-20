import type { TabId } from "@/store/useUIStore";

export interface MapPin {
  id: TabId;
  label: string;
  /** One line describing the destination, shown on the detail card. */
  blurb: string;
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
  {
    id: "projects",
    label: "Projects",
    blurb: "Things built end to end, shipped or shelved.",
    x: 20,
    y: 40,
  },
  {
    id: "certificates",
    label: "Certificates",
    blurb: "Coursework and credentials, issuer on file.",
    x: 44,
    y: 22,
  },
  {
    id: "repos",
    label: "Repos",
    blurb: "Public source, where the code is readable.",
    x: 70,
    y: 36,
  },
  {
    id: "resume",
    label: "Resume",
    blurb: "The one-page version, kept current.",
    x: 80,
    y: 66,
  },
  {
    id: "about",
    label: "About",
    blurb: "Who is behind all of this, briefly.",
    x: 36,
    y: 70,
  },
];

export const pinById = (id: TabId) =>
  MAP_PINS.find((p) => p.id === id) ?? MAP_PINS[0];
