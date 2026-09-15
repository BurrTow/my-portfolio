import type { ReactNode } from "react";

/**
 * Inert stand-in for a link that doesn't exist yet. Keeps the cut-corner
 * silhouette of a real button so the row doesn't collapse, but drops to the
 * muted edge colour and carries no hover, cursor, or focus affordance.
 */
export function PendingLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`notched inline-flex select-none items-center gap-2 px-5 py-2.5 font-ui text-sm font-semibold uppercase tracking-wide text-ink/40 [--edge:theme(colors.beige.dark)] [--fill:theme(colors.beige.light)] ${className}`}
    >
      {children}
    </span>
  );
}
