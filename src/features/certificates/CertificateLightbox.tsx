import type { Certificate } from "@/types/content";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

/**
 * Certificate scan at full size.
 *
 * The viewer itself is shared with the project demo carousel — see
 * ImageLightbox for the portal, focus and dismissal behaviour. This only maps
 * a Certificate onto it.
 */
export function CertificateLightbox({
  certificate,
  onClose,
}: {
  certificate: Certificate;
  onClose: () => void;
}) {
  return (
    <ImageLightbox
      src={certificate.image ?? ""}
      alt={`${certificate.name} certificate`}
      title={`${certificate.name} certificate`}
      subtitle={[certificate.issuer, certificate.date]
        .filter(Boolean)
        .join(" · ")}
      footnote={
        certificate.credentialId
          ? `Credential ${certificate.credentialId}`
          : undefined
      }
      onClose={onClose}
    />
  );
}
