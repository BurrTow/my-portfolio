export type ButtonVariant = "primary" | "ghost";

export function buttonClassNames(variant: ButtonVariant = "primary") {
  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 font-ui font-semibold uppercase tracking-wide text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none";
  const styles =
    variant === "primary"
      ? "clip-notch bg-ink text-beige-light hover:bg-ink-light"
      : "notched text-ink [--fill:theme(colors.beige.light)] hover:[--fill:theme(colors.ink.DEFAULT)] hover:text-beige-light";
  return `${base} ${styles}`;
}
