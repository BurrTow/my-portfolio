import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

/**
 * Shared hoverable/tappable surface for project, cert, and repo cards.
 *
 * The scale lives on the surface layer, not on the card as a whole, so the
 * frame pops while the text stays exactly where it is. Scaling the whole card
 * meant every glyph was re-rasterised at a fractional size for the length of
 * the transition, which read as the text going soft rather than as the card
 * lifting.
 *
 * Two nested elements rather than one: `.notched` sets `position: relative`
 * itself, so putting it on the absolutely-positioned layer silently collapses
 * that layer to zero size and the card loses its frame entirely. The outer
 * span does the positioning, the inner one does the shape.
 *
 * A CSS transition rather than a Framer variant: the surface is decorative and
 * has no state of its own, and the global prefers-reduced-motion rule in
 * index.css already collapses CSS transitions to nothing.
 */
export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`group relative ${FOCUS_RING} ${className}`} {...props}>
      <span aria-hidden className="absolute inset-0">
        <span className="notched block h-full w-full origin-center transition-transform duration-150 ease-out [--fill:theme(colors.p3-black.panel)] group-hover:scale-[1.02] group-hover:[--edge:theme(colors.p3-red.DEFAULT)] group-hover:[--fill:theme(colors.p3-black.raised)] group-active:scale-[0.98]" />
      </span>
      <div className="relative p-5">{children}</div>
    </div>
  );
}
