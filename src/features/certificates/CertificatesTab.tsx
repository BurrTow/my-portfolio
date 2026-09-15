import { motion } from "framer-motion";
import { certificates } from "@/data/certificates";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer } from "@/theme/motion";
import { CertificateCard } from "@/features/certificates/CertificateCard";

export function CertificatesTab() {
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
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
