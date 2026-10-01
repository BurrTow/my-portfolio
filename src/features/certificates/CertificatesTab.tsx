import { motion } from "framer-motion";
import { useState } from "react";
import { certificates } from "@/data/certificates";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer } from "@/theme/motion";
import { CertificateCard } from "@/features/certificates/CertificateCard";
import { CertificateLightbox } from "@/features/certificates/CertificateLightbox";

export function CertificatesTab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = certificates.find((c) => c.id === openId) ?? null;

  return (
    <div>
      <SectionHeading
        title="Certificates"
        subtitle="Credentials earned along the way."
      />
      {certificates.length === 0 ? (
        <EmptyState title="No certificates listed yet" />
      ) : (
        <motion.div
          initial="initial"
          animate="enter"
          variants={staggerContainer}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onOpen={() => setOpenId(cert.id)}
            />
          ))}
        </motion.div>
      )}
      {open && (
        <CertificateLightbox
          certificate={open}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
