export function Tag({ children }: { children: string }) {
  return (
    <span className="border border-ink/70 px-2 py-0.5 font-ui text-xs font-medium uppercase tracking-wide text-ink/80">
      {children}
    </span>
  );
}
