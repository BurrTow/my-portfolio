import type { Project } from "@/types/content";

/**
 * One line covering how a project was staffed and who holds the repository.
 *
 * Kept together rather than as two notes: they are the same thought from a
 * reader's point of view, and stacking two dim lines under every card would
 * weigh more than the facts justify. Returns null for solo work owned by the
 * author, which is the case that needs no explanation.
 */
export function projectCredit(project: Project): string | null {
  const parts: string[] = [];
  if (project.teamSize && project.teamSize > 1) {
    parts.push(`${project.teamSize}-person team`);
  }
  if (project.repoOwnedByOther) parts.push("repo hosted by teammate");
  return parts.length ? parts.join(" — ") : null;
}
