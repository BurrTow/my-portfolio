import { create } from "zustand";

// State-based tab switching instead of React Router: there are no distinct
// routes/URLs to deep-link here, just one screen with five menu panels, so a
// router would add a dependency and history-stack complexity (e.g. back-button
// semantics across tabs) without any real benefit over a Zustand-held TabId.
// About sits last so Projects remains the landing view.
/** Source of truth for tab order. Nav, arrow-key navigation and the map pins
 * all derive from this, so adding a tab here is most of the work. */
export const TABS = [
  "projects",
  "certificates",
  "repos",
  "resume",
  "about",
] as const;
export type TabId = (typeof TABS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  projects: "Projects",
  certificates: "Certificates",
  repos: "Repos",
  resume: "Resume",
  about: "About",
};

// Five tabs share 375px on a phone, giving each a 75px slot. "Certificates"
// needs 105px and "Projects" 80px at that size, so those two get shorter
// forms below the md breakpoint; the rest already fit and stay as they are.
export const TAB_LABELS_SHORT: Record<TabId, string> = {
  ...TAB_LABELS,
  projects: "Work",
  certificates: "Certs",
};

interface UIState {
  activeTab: TabId;
  /**
   * Increments on every navigation request, including one that resolves to
   * the tab already showing. The transition watches this rather than the tab
   * value: inferring "navigation happened" from the value changing means
   * confirming your current destination looks like nothing happened at all.
   */
  navSeq: number;
  /** Mirrors the map overlay so occluded work can be paused while it is up. */
  mapOpen: boolean;
  /**
   * Hold this true for as long as the map is *visible*, including while it
   * animates away. MapScreen runs its own exit and only reports closed once it
   * finishes, which is what keeps BackgroundFX frozen under a semi-transparent
   * screen. Flipping it at the start of the exit reintroduces the regression in
   * docs/performance.md.
   */
  setMapOpen: (open: boolean) => void;
  /** Also bumps `navSeq`, which is what actually drives the tab transition. */
  setActiveTab: (tab: TabId) => void;
  introDone: boolean;
  /** Marks the intro seen for this browser as well as this session. */
  finishIntro: () => void;
}

// Skip the boot sequence for returning visitors. localStorage rather than
// sessionStorage: a new tab tomorrow is still a repeat visit.
const INTRO_KEY = "portfolio:intro-seen";

export const useUIStore = create<UIState>((set) => ({
  activeTab: "projects",
  navSeq: 0,
  mapOpen: false,
  setMapOpen: (open) => set({ mapOpen: open }),
  setActiveTab: (tab) =>
    set((s) => ({ activeTab: tab, navSeq: s.navSeq + 1 })),
  introDone: false,
  finishIntro: () => {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — intro just replays.
    }
    set({ introDone: true });
  },
}));
