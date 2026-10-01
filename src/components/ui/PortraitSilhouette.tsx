/**
 * Placeholder portrait: geometry, not artwork.
 *
 * Drawn as an obvious silhouette rather than something pretending to be a
 * photograph, so it reads as "image pending" instead of looking like a failed
 * asset load. Swap it for a real photo or illustration when one exists.
 */
export function PortraitSilhouette({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 80"
      fill="none"
      className={className}
    >
      <circle cx="32" cy="27" r="14" fill="currentColor" opacity="0.5" />
      <path
        d="M6 80 C6 60 17 50 32 50 C47 50 58 60 58 80 Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* A single diagonal catches the light the way the site's cuts do. */}
      <path
        d="M0 62 L64 30"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </svg>
  );
}
