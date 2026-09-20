import { motion } from "framer-motion";
import { useState } from "react";
import {
  TABS,
  TAB_LABELS,
  TAB_LABELS_SHORT,
  useUIStore,
  type TabId,
} from "@/store/useUIStore";
import { useArrowKeyTabNav } from "@/hooks/useArrowKeyTabNav";
import { TabIcon } from "@/components/ui/TabIcon";
import { GlitchLabel } from "@/components/ui/GlitchLabel";
import { FOCUS_RING } from "@/components/ui/buttonStyles";
import {
  bladeItemVariants,
  bladeItemVariantsMobile,
  bladeListVariants,
  selectionHighlightTransition,
} from "@/theme/motion";

export function Nav() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const handleKeyDown = useArrowKeyTabNav(activeTab, setActiveTab);
  // Focus counts as hover here so the effect is reachable from the keyboard,
  // not just the mouse. Only the desktop blades use it — the mobile bar has no
  // hover state to trigger it.
  const [hovered, setHovered] = useState<TabId | null>(null);

  return (
    <>
      {/* Desktop: vertical blade menu, left side */}
      <motion.nav
        initial="initial"
        animate="enter"
        variants={bladeListVariants}
        role="tablist"
        aria-orientation="vertical"
        aria-label="Primary"
        onKeyDown={handleKeyDown}
        className="fixed left-0 top-0 z-20 hidden h-full w-56 flex-col justify-center gap-3 border-r border-p3-blue/20 bg-p3-black px-4 md:flex"
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <motion.button
              key={tab}
              variants={bladeItemVariants}
              role="tab"
              id={`tab-desktop-${tab}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onMouseEnter={() => setHovered(tab)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(tab)}
              onBlur={() => setHovered(null)}
              className={`group relative flex h-12 items-center gap-3 pl-5 pr-3 ${FOCUS_RING}`}
            >
              <motion.span
                layout
                layoutDependency={activeTab}
                transition={selectionHighlightTransition}
                className={`clip-slice absolute inset-0 transition-colors duration-150 ${
                  isActive
                    ? "bg-p3-blue-deep"
                    : "bg-transparent group-hover:bg-p3-black-raised"
                }`}
              />
              <TabIcon
                id={tab}
                className={`relative z-10 h-5 w-5 shrink-0 transition-colors duration-150 ${
                  isActive
                    ? "text-p3-white"
                    : "text-p3-blue/70 group-hover:text-p3-white"
                }`}
              />
              <GlitchLabel
                text={TAB_LABELS[tab]}
                active={hovered === tab}
                className={`relative z-10 -skew-x-6 font-ui text-lg font-semibold uppercase tracking-wide transition-colors duration-150 ${
                  isActive
                    ? "text-p3-white"
                    : "text-p3-white/65 group-hover:text-p3-white"
                }`}
              />
              {isActive && (
                <span className="absolute left-0 top-0 z-10 h-full w-1.5 bg-p3-red" />
              )}
            </motion.button>
          );
        })}
      </motion.nav>

      {/* Mobile: bottom tab bar */}
      <motion.nav
        initial="initial"
        animate="enter"
        variants={bladeListVariants}
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Primary"
        onKeyDown={handleKeyDown}
        className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-stretch justify-around border-t border-p3-blue/30 bg-p3-black px-1 pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <motion.button
              key={tab}
              variants={bladeItemVariantsMobile}
              role="tab"
              id={`tab-mobile-${tab}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={`relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                isActive ? "bg-p3-blue-deep" : "hover:bg-p3-black-raised"
              } ${FOCUS_RING}`}
            >
              {isActive && (
                <motion.span
                  layout
                  layoutDependency={activeTab}
                  transition={selectionHighlightTransition}
                  className="absolute inset-x-0 top-0 h-1 bg-p3-red"
                />
              )}
              <TabIcon
                id={tab}
                className={`h-5 w-5 ${
                  isActive ? "text-p3-white" : "text-p3-blue/70"
                }`}
              />
              <span
                className={`font-ui text-xs font-semibold uppercase tracking-wide ${
                  isActive ? "text-p3-white" : "text-p3-white/65"
                }`}
              >
                {TAB_LABELS_SHORT[tab]}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>
    </>
  );
}
