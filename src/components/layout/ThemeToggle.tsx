import { useThemeStore } from "@/store/useThemeStore";

/**
 * Light/dark switch, parked just left of App.tsx's fixed Map button.
 *
 * shortcut: the offset assumes the Map button is ~66px wide (right-4 plus a
 * three-letter label); if that label or its font changes, move both into one
 * flex row in App.tsx instead.
 *
 * Shape, fill and focus ring come from .action in index.css; the fill is on
 * pseudo-elements, so its clip never hides the ring.
 *
 * z-20, under the map overlay's z-30, so it never sits on top of the map
 * header while the Map button itself is hidden.
 */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={light}
      // Primary header action, filled like MAP so the pair reads as one
      // group: 32px tall with the 8px notch, 40px wide (44x44 on touch). The
      // top keeps its centre level with the Map button's (34px down).
      // on-blue: it sits on the blue panel/corner, so its ring is cyan in light.
      className="on-blue action action-sm action-primary fixed right-[5.75rem] top-[calc(34px_-_var(--action-h-sm)_/_2)] z-20 w-[max(40px,var(--action-h-sm))]"
    >
      {/* Both icons stay mounted so the swap is a cross-fade, not a remount. */}
      <SunIcon
        className={`absolute inset-0 m-auto h-4 w-4 transition-[opacity,transform] duration-150 ${
          light ? "rotate-90 scale-50 opacity-0" : "opacity-100"
        }`}
      />
      <MoonIcon
        className={`absolute inset-0 m-auto h-4 w-4 transition-[opacity,transform] duration-150 ${
          light ? "opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
    </button>
  );
}

// Shows the mode you would switch to, matching the label.
function SunIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}
