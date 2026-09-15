import type { Project } from "@/types/content";

export const projects: Project[] = [
  {
    id: "velvet-dash",
    title: "Velvet Dash",
    description:
      "A real-time analytics dashboard with streaming charts and a dense, card-based layout for monitoring service health at a glance.",
    tech: ["React", "TypeScript", "WebSocket", "D3"],
    link: "https://example.com/velvet-dash",
    repo: "https://github.com/example/velvet-dash",
    year: 2025,
  },
  {
    id: "tartarus-cli",
    title: "Tartarus CLI",
    description:
      "A developer tool that generates scaffolding for serverless functions from a single declarative config file.",
    tech: ["Node.js", "TypeScript", "Commander"],
    repo: "https://github.com/example/tartarus-cli",
    year: 2024,
  },
  {
    id: "aegis-auth",
    title: "Aegis Auth",
    description:
      "A drop-in authentication service supporting OAuth2, magic links, and passkeys with a focus on minimal integration overhead.",
    tech: ["Go", "PostgreSQL", "Redis"],
    link: "https://example.com/aegis-auth",
    repo: "https://github.com/example/aegis-auth",
    year: 2024,
  },
  {
    id: "paper-notes",
    title: "Paper Notes",
    description:
      "An offline-first note-taking app with end-to-end encrypted sync and a distraction-free, typewriter-style editor.",
    tech: ["React Native", "SQLite", "CRDT"],
    link: "https://example.com/paper-notes",
    year: 2023,
  },
];
