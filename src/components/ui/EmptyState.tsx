/**
 * Shown in place of a grid when its data array is empty, so a tab reads as
 * deliberately-not-yet-filled rather than broken. Uses the same cut-corner
 * surface as the cards, dropped to the muted edge colour.
 */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="notched flex flex-col items-center justify-center px-6 py-16 text-center [--edge:theme(colors.beige.dark)] [--fill:theme(colors.beige.light)]">
      <p className="font-display font-bold text-lg text-ink/50">{title}</p>
      {hint && (
        <p className="mt-2 max-w-sm font-ui text-sm text-ink/40">{hint}</p>
      )}
    </div>
  );
}
