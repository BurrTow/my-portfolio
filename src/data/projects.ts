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
    // Desktop app, so stills rather than a frame or a clip.
    thumbnail: "/thumbs/Chelsys.webp",
    demo: {
      type: "images",
      images: [
        {
          src: "/demos/chelsys/01-dashboard.webp",
          alt: "Dashboard with daily sales, stock warnings and projected stock runout",
          caption: "Daily sales, stock warnings, and projected stock runout",
        },
        {
          src: "/demos/chelsys/02-new-order.webp",
          alt: "New order screen with cart, payment method and change calculation",
          caption: "Ordering with cash and GCash payments and automatic change",
        },
        {
          src: "/demos/chelsys/03-order-history.webp",
          alt: "Order history table with search and filters",
          caption: "Searchable order history with payment and status filters",
        },
        {
          src: "/demos/chelsys/04-inventory-log.webp",
          alt: "Inventory log with category filters and pack status",
          caption: "Pack-based inventory logging by category",
        },
        {
          src: "/demos/chelsys/05-deliveries.webp",
          alt: "Purchase orders and deliveries with status badges",
          caption:
            "Supplier purchase orders with status tracking and quantity-difference flags",
        },
        {
          src: "/demos/chelsys/06-accounts.webp",
          alt: "Accounts page with roles and data backup tools",
          caption: "Role-based accounts plus database backup and restore",
        },
        {
          src: "/demos/chelsys/07-cashier-view.webp",
          alt: "Cashier view with limited navigation",
          caption:
            "Cashiers see only New Order, Order History, and Inventory Log",
        },
      ],
    },
  },
  {
    id: "gastok",
    title: "Gastok",
    description:
      "A multilingual AI expense tracker with voice and text input, built for Filipino college students. Supports English and Tagalog, with Bisaya in development.",
    tech: ["C++", "Flutter", "Dart", "CMake"],
    // repo: "https://github.com/sheleek1n/Gastok-Expense-Tracker-App,
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
    thumbnail: '/thumbs/subnetct.webp',
    demo: {
      type: "live",
      url: "https://burrtow.github.io/subnetct/",
    },
  },
];
