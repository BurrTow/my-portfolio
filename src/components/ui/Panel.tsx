import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bladed shadow-blade [--fill:theme(colors.beige.light)] ${className}`}
    >
      {children}
    </div>
  );
}
