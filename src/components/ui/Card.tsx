import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** Whole-card hover lift. Off for large content cards that shouldn't move. */
  pop?: boolean;
}

/**
 * Shared hoverable/tappable surface for project, cert, and repo cards.
 *
 * The hover lift (`.card-pop`, index.css) scales the whole card so frame,
 * image, and text move as one. It is gated to hover-capable fine pointers and
 * to no-preference motion in CSS, so touch and reduced-motion get none.
 *
 * Two nested elements rather than one: `.notched` sets `position: relative`
 * itself, so putting it on the absolutely-positioned layer silently collapses
 * that layer to zero size and the card loses its frame entirely. The outer
 * span does the positioning, the inner one does the shape.
 */
export function Card({ children, className = "", pop = true, ...props }: CardProps) {
  return (
    <div
      className={`group relative ${pop ? "card-pop" : ""} ${FOCUS_RING} ${className}`}
      {...props}
    >
      <span aria-hidden className="absolute inset-0">
        <span className="notched block h-full w-full origin-center transition-transform duration-150 ease-out [--fill:theme(colors.p3-black.panel)] group-hover:[--edge:theme(colors.p3-red.DEFAULT)] group-hover:[--fill:theme(colors.p3-black.raised)] group-active:scale-[0.98]" />
      </span>
      <div className="relative p-5">{children}</div>
    </div>
  );
}
