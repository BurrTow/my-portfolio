import { motion } from "framer-motion";
import type { Certificate } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { staggerItem } from "@/theme/motion";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Card className="h-full">
        <h3 className="font-display text-lg font-bold text-p3-white">
          {certificate.name}
        </h3>
        <p className="mt-1 font-ui text-sm text-p3-white/50">
          {[certificate.issuer, certificate.date].filter(Boolean).join(" · ")}
        </p>
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
            className="mt-3 px-3 py-1.5 text-xs"
          >
            Verify ↗
          </LinkButton>
        )}
      </Card>
    </motion.div>
  );
}
