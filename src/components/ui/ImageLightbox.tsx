import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

/**
 * Full-screen viewer for a single image.
 *
 * Opened by a click rather than a hover: hover does not exist on touch
 * devices, and on a phone this is the only way to read a certificate or see a
 * screenshot at a usable size.
 *
 * The backdrop is opaque, matching the map screen. A translucent full-viewport
 * layer would sit over the drifting stripe backdrop, which is the compositing
 * cost that has bitten this project repeatedly — and only the map pauses that
 * drift.
 *
 * Rendered through a portal. The tab wrapper carries a clip-path for the slice
 * transition, and a clipped ancestor becomes the containing block for
 * `position: fixed` children — in place, this sat inside the panel instead of
 * over the viewport, leaving the nav uncovered and the image clipped.
 *
 * Closes three ways, the same set the map screen offers: the close button,
 * Escape, and clicking away from the frame.
 *
 * `onNavigate` is optional and exists for the carousel: when present, Left and
 * Right move between images without leaving the viewer.
 */
export function ImageLightbox({
  src,
  alt,
  title,
  subtitle,
  footnote,
  onClose,
  onNavigate,
}: {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  /** Trailing note on the bottom row, opposite the key hints. */
  footnote?: ReactNode;
  onClose: () => void;
  onNavigate?: (delta: 1 | -1) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog so keys land here and screen readers follow.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        return onClose();
      }
      if (!onNavigate) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        return onNavigate(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        return onNavigate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate]);

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // Clicking the field around the frame dismisses; the frame itself stops
      // the event so a click on the image never closes the view.
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-p3-black p-4 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="-skew-x-6 truncate font-display text-xl font-bold text-p3-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/50">
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`clip-notch shrink-0 bg-p3-blue-deep px-4 py-2 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white hover:bg-p3-blue ${FOCUS_RING}`}
        >
          Close
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="notched flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 [--fill:theme(colors.p3-black.panel)]"
      >
        <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-ui text-xs uppercase tracking-wide text-p3-white/50">
          <span className="text-p3-white/80">Esc</span> Close ·{" "}
          {onNavigate && (
            <>
              <span className="text-p3-white/80">← →</span> Browse ·{" "}
            </>
          )}
          <span className="text-p3-white/80">Click away</span> to dismiss
        </p>
        {footnote && (
          <p className="font-ui text-xs uppercase tracking-wide text-p3-white/40">
            {footnote}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
