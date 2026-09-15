export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="relative inline-block -skew-x-6 font-display font-bold text-3xl text-ink sm:text-4xl">
        {title}
        <span className="absolute -bottom-1 left-0 h-1.5 w-2/3 bg-accent" />
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-prose font-ui text-base italic text-ink-soft">
          {subtitle}
        </p>
      )}
    </div>
  );
}
