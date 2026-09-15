import type { Certificate } from "@/types/content";

export const certificates: Certificate[] = [
  {
    id: "aws-saa",
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    date: "2025-03",
    verifyUrl: "https://example.com/verify/aws-saa",
  },
  {
    id: "cka",
    name: "Certified Kubernetes Administrator",
    issuer: "Cloud Native Computing Foundation",
    date: "2024-09",
    verifyUrl: "https://example.com/verify/cka",
  },
  {
    id: "gcp-pd",
    name: "Google Cloud Professional Developer",
    issuer: "Google Cloud",
    date: "2024-01",
    verifyUrl: "https://example.com/verify/gcp-pd",
  },
  {
    id: "ts-fundamentals",
    name: "Advanced TypeScript for Application Development",
    issuer: "Frontend Masters",
    date: "2023-06",
  },
];
