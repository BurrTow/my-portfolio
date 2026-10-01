import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Certificate } from "@/types/content";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

/**
 * Full-size view of a certificate scan.
 *
 * Opened by clicking a card rather than by hovering one: hover does not exist
 * on touch devices, and this is the only way to read the credential on a phone.
 *
 * The backdrop is opaque, matching the map screen. A translucent full-viewport
 * layer would sit over the drifting stripe backdrop, which is the compositing
 * cost that has bitten this project twice — and only the map currently pauses
 * that drift.
 *
 * Closes three ways, the same set the map screen offers: the close button,
 * Escape, and clicking away from the frame.
 *
 * Rendered through a portal rather than in place. The tab wrapper carries a
 * clip-path for the slice transition, and a clipped ancestor becomes the
 * containing block for `position: fixed` children — so in place this sat inside
 * the panel instead of over the viewport, leaving the nav uncovered and the
 * image clipped.
 */
export function CertificateLightbox({
  certificate,
  onClose,
}: {
  certificate: Certificate;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog so keys land here and screen readers follow.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${certificate.name} certificate`}
      // Clicking the field around the frame dismisses; the frame itself stops
      // the event so a click on the image never closes the view.
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-p3-black p-4 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="-skew-x-6 truncate font-display text-xl font-bold text-p3-white sm:text-2xl">
            {certificate.name}
          </h2>
          <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/50">
            {[certificate.issuer, certificate.date].filter(Boolean).join(" · ")}
          </p>
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
        <img
          src={certificate.image}
          alt={`${certificate.name} certificate`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-ui text-xs uppercase tracking-wide text-p3-white/50">
          <span className="text-p3-white/80">Esc</span> Close ·{" "}
          <span className="text-p3-white/80">Click away</span> to dismiss
        </p>
        {certificate.credentialId && (
          <p className="font-ui text-xs uppercase tracking-wide text-p3-white/40">
            Credential {certificate.credentialId}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
