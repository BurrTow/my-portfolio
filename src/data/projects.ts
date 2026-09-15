import type { Project } from "@/types/content";

// Repo URLs are held here until each repository is made public. Uncomment the
// `repo` line for a project once its repo is live; the card and detail view
// switch from "Repo coming soon" to a real link automatically.
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
    // repo: "https://github.com/sheleek1n/Sia2-Chelsys-burger",
  },
  {
    id: "gastoai",
    title: "GastoAI",
    description:
      "A multilingual AI expense tracker with voice and text input, built for Filipino college students. Supports English and Tagalog, with Bisaya in development.",
    tech: ["C++", "Flutter", "Dart", "CMake"],
    // repo: "https://github.com/sheleek1n/GastoAI-Expense-Tracker-App",
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
  },
];
