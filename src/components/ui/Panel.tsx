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
      className={`bladed [--fill:theme(colors.p3-black.panel)] ${className}`}
    >
      {children}
    </div>
  );
}
