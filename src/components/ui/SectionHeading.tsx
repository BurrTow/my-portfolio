export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="relative inline-block -skew-x-6 font-display text-3xl font-bold text-p3-white sm:text-4xl">
        {title}
        <span className="absolute -bottom-1 left-0 h-1.5 w-2/3 bg-p3-red" />
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-prose font-ui text-base text-p3-white/70">
          {subtitle}
        </p>
      )}
    </div>
  );
}
