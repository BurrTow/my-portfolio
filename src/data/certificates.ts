import type { Certificate } from "@/types/content";

export const certificates: Certificate[] = [
  {
    id: "cisco-intro-cybersecurity",
    name: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    date: "January 26, 2026",
    image: "/certificates/intro-to-cybersecurity.webp",
    description:
      "Cisco-certified course covering the basics of cybersecurity, including the threat landscape and core defensive practices.",
  },
  {
    id: "cisco-intro-networks",
    name: "CCNA: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    date: "January 20, 2026",
    image: "/certificates/ccna-intro-to-networks.webp",
    description:
      "Cisco-certified course covering core networking fundamentals.",
  },
  {
    id: "cisco-networking-devices",
    name: "Networking Devices and Basic Configuration",
    issuer: "Cisco Networking Academy",
    date: "February 25, 2026",
    image: "/certificates/networking-devices-basic-config.webp",
    description:
      "Cisco-certified course covering network device setup and initial configuration.",
  },
  {
    id: "lean-six-sigma-white-belt",
    name: "Lean Six Sigma — White Belt",
    issuer: "Lean Six Sigma",
    date: "January 12, 2026",
    credentialId: "111735458",
    image: "/certificates/lean-six-sigma-white-belt.webp",
    description:
      "Foundation-level certification in Lean Six Sigma process improvement principles.",
  },
  {
    id: "lean-six-sigma-yellow-belt",
    name: "Lean Six Sigma — Yellow Belt",
    issuer: "Lean Six Sigma",
    date: "January 12, 2026",
    credentialId: "111736307",
    image: "/certificates/lean-six-sigma-yellow-belt.webp",
    description:
      "Certification covering Lean Six Sigma methodology and supporting roles in process improvement projects.",
  },
];
