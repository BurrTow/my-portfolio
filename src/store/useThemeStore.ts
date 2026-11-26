import { create } from "zustand";

export type Theme = "light" | "dark";

// Same key and colours as the inline script in index.html.
const THEME_KEY = "portfolio:theme";
const THEME_COLOR: Record<Theme, string> = { light: "#F3F7FA", dark: "#0E0E10" };

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // index.html has already resolved storage and prefers-color-scheme before
  // React loads, so the attribute it set is the starting value.
  theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
  toggleTheme: () => {
    const theme: Theme = get().theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[theme]);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage blocked — the choice holds for this visit only.
    }
    set({ theme });
  },
}));
