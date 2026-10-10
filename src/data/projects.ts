import type { Project } from "@/types/content";

// Repo URLs are held here until each repository is made public. Uncomment the
// `repo` line for a project once its repo is live; the card and detail view
// switch from "Repo coming soon" to a real link automatically.
//
// teamSize and repoOwnedByOther drive the credit line under each card, so
// staffing and repo ownership are stated up front rather than inferred from
// the URL after following it.
export const projects: Project[] = [
  {
    id: "chelsys-burger-pos",
    title: "Chelsy's Burger POS System",
    description:
      "A point-of-sale system built for a local restaurant chain, covering order entry, sales tracking, and reporting as a desktop application.",
    tech: [
      "JavaScript",
      "React",
      "TailwindCSS",
      "Electron",
      "better-sqlite3",
      "Recharts",
      "Vite",
      "ESLint",
    ],
    repo: "https://github.com/sheleek1n/chelsys-burger-system",
    repoOwnedByOther: true,
    teamSize: 3,
    // Desktop app, so stills rather than a frame or a clip. Paths are declared
    // ahead of the files; the panel shows a placeholder until they land.
    demo: {
      type: "images",
      images: [
        "/demos/chelsys/01.png",
        "/demos/chelsys/02.png",
        "/demos/chelsys/03.png",
      ],
    },
  },
  {
    id: "gastoai",
    title: "GastoAI",
    description:
      "A multilingual AI expense tracker with voice and text input, built for Filipino college students. Supports English and Tagalog, with Bisaya in development.",
    tech: ["C++", "Flutter", "Dart", "CMake"],
    // repo: "https://github.com/sheleek1n/GastoAI-Expense-Tracker-App",
    repoOwnedByOther: true,
    teamSize: 3,
    // Mobile app: nothing to frame, so a recorded walkthrough.
    demo: {
      type: "video",
      url: "/demos/gastok.mp4",
      poster: "/demos/gastok-poster.jpg",
    },
  },
  {
    id: "basic-subnet-calculator",
    title: "Basic Subnet Calculator",
    description:
      "A browser-based subnet calculator, built with a Vite toolchain and deployed through GitHub Actions to GitHub Pages.",
    tech: [
      "JavaScript",
      "HTML",
      "CSS",
      "ESLint",
      "Vite",
      "GitHub Actions",
      "GitHub Pages",
    ],
    repo: "https://github.com/BurrTow/subnetct",
    // The only one that is already hosted, so it can be framed for real.
    demo: {
      type: "live",
      url: "https://burrtow.github.io/subnetct/",
    },
  },
];
