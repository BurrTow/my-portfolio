import { motion } from "framer-motion";
import type { Certificate } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { staggerItem } from "@/theme/motion";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <motion.div variants={staggerItem}>
      <Card>
        <h3 className="font-display font-bold text-base text-ink sm:text-lg">
          {certificate.name}
        </h3>
        <p className="mt-1 font-ui text-sm text-ink-soft">
          {certificate.issuer} · {certificate.date}
        </p>
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
