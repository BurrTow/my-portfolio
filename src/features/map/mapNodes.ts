import type { TabId } from "@/store/useUIStore";

export interface MapNode {
  id: TabId;
  label: string;
  icon: string;
  /** Position as a percentage of the map area, so layout is resolution free. */
  x: number;
  y: number;
}

export const MAP_NODES: MapNode[] = [
  { id: "projects", label: "Projects", icon: "◈", x: 18, y: 30 },
  { id: "certificates", label: "Certificates", icon: "❖", x: 50, y: 16 },
  { id: "repos", label: "Repos", icon: "⬡", x: 82, y: 32 },
  { id: "resume", label: "Resume", icon: "▤", x: 68, y: 74 },
  { id: "about", label: "About", icon: "◉", x: 26, y: 72 },
];

/** Walkable connections, as a ring so every node stays reachable. */
export const MAP_EDGES: [TabId, TabId][] = [
  ["projects", "certificates"],
  ["certificates", "repos"],
  ["repos", "resume"],
  ["resume", "about"],
  ["about", "projects"],
];

export const nodeById = (id: TabId) =>
  MAP_NODES.find((n) => n.id === id) ?? MAP_NODES[0];

const neighbours = (id: TabId): TabId[] =>
  MAP_EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

/**
 * Picks the connected node that best matches a direction, rather than mapping
 * each key to a fixed destination. Movement then reads as travelling across
 * the map instead of stepping through a list, and the layout can be rearranged
 * without rewriting the key handling.
 *
 * Candidates more than 90 degrees off the pressed direction are rejected, so a
 * key never sends the cursor somewhere visibly backwards.
 */
export function nodeInDirection(from: TabId, dx: number, dy: number): TabId | null {
  const origin = nodeById(from);
  let best: { id: TabId; score: number } | null = null;

  for (const id of neighbours(from)) {
    const n = nodeById(id);
    const vx = n.x - origin.x;
    const vy = n.y - origin.y;
    const len = Math.hypot(vx, vy);
    if (len === 0) continue;

    // Cosine of the angle between the key direction and this neighbour.
    const alignment = (vx / len) * dx + (vy / len) * dy;
    if (alignment <= 0.1) continue;

    if (!best || alignment > best.score) best = { id, score: alignment };
  }

  return best?.id ?? null;
}
