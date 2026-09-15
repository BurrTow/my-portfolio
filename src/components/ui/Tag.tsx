export function Tag({ children }: { children: string }) {
  return (
    <span className="border border-p3-blue/60 px-2 py-0.5 font-ui text-xs font-medium uppercase tracking-wide text-p3-white/70">
      {children}
    </span>
  );
}
