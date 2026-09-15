/**
 * Shown in place of a grid when its data array is empty, so a tab reads as
 * deliberately-not-yet-filled rather than broken. Uses the same cut-corner
 * surface as the cards, dropped to the muted edge colour.
 */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="notched flex flex-col items-center justify-center px-6 py-16 text-center [--edge:theme(colors.p3-blue.dark)] [--fill:theme(colors.p3-black.panel)]">
      <p className="font-display text-lg font-bold text-p3-white/70">{title}</p>
      {hint && (
        <p className="mt-2 max-w-sm font-ui text-sm text-p3-white/50">{hint}</p>
      )}
    </div>
  );
}
