import { create } from "zustand";

// State-based tab switching instead of React Router: there are no distinct
// routes/URLs to deep-link here, just one screen with four menu panels, so a
// router would add a dependency and history-stack complexity (e.g. back-button
// semantics across tabs) without any real benefit over a Zustand-held TabId.
export const TABS = ["projects", "certificates", "repos", "resume"] as const;
export type TabId = (typeof TABS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  projects: "Projects",
  certificates: "Certificates",
  repos: "Repos",
  resume: "Resume",
};

interface UIState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  introDone: boolean;
  finishIntro: () => void;
}

// Skip the boot sequence on repeat visits within the same tab session.
const INTRO_KEY = "portfolio:intro-seen";

export const useUIStore = create<UIState>((set) => ({
  activeTab: "projects",
  setActiveTab: (tab) => set({ activeTab: tab }),
  introDone:
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(INTRO_KEY) === "1",
  finishIntro: () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — intro just replays.
    }
    set({ introDone: true });
  },
}));
