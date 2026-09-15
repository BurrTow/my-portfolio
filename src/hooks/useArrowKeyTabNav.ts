import type { KeyboardEvent } from "react";
import { TABS, type TabId } from "@/store/useUIStore";

/**
 * Arrow-key navigation across the tab list (Left/Up = previous, Right/Down =
 * next, Home/End = first/last), matching the game menu's directional feel.
 */
export function useArrowKeyTabNav(
  activeTab: TabId,
  setActiveTab: (tab: TabId) => void,
) {
  return (event: KeyboardEvent) => {
    const index = TABS.indexOf(activeTab);
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (index - 1 + TABS.length) % TABS.length;
        break;
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(TABS[nextIndex]);
  };
}
