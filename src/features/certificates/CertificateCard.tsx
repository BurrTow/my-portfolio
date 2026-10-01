import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import type { Certificate } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { staggerItem } from "@/theme/motion";

export function CertificateCard({
  certificate,
  onOpen,
}: {
  certificate: Certificate;
  onOpen?: () => void;
}) {
  // No scan on file means no control: a card that opens an empty viewer is
  // worse than one that simply does not invite the click.
  const openable = Boolean(certificate.image && onOpen);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onOpen?.();
  };

  return (
    <motion.div variants={staggerItem} className="h-full">
      <Card
        className={`h-full ${openable ? "cursor-pointer" : ""}`}
        {...(openable
          ? {
              role: "button",
              tabIndex: 0,
              onClick: onOpen,
              onKeyDown: handleKeyDown,
              "aria-label": `View the ${certificate.name} certificate`,
            }
          : {})}
      >
        <h3 className="font-display text-lg font-bold text-p3-white">
          {certificate.name}
        </h3>
        <p className="mt-1 font-ui text-sm text-p3-white/50">
          {[certificate.issuer, certificate.date].filter(Boolean).join(" · ")}
        </p>
        {certificate.credentialId && (
          <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/40">
            Credential {certificate.credentialId}
          </p>
        )}
        {certificate.description && (
          <p className="mt-3 font-ui text-sm text-p3-white/70">
            {certificate.description}
          </p>
        )}
        {certificate.verifyUrl && (
          <LinkButton
            variant="ghost"
            href={certificate.verifyUrl}
            target="_blank"
            rel="noreferrer"
            // The card itself may be the control that opens the scan, so this
            // link has to stop the click from also triggering it.
            onClick={(e) => e.stopPropagation()}
            className="mt-3 px-3 py-1.5 text-xs"
          >
            Verify ↗
          </LinkButton>
        )}
      </Card>
    </motion.div>
  );
}
