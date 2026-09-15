import { motion } from "framer-motion";
import { TABS, TAB_LABELS, useUIStore } from "@/store/useUIStore";
import { useArrowKeyTabNav } from "@/hooks/useArrowKeyTabNav";
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
        className="fixed left-0 top-0 z-20 hidden h-full w-56 flex-col justify-center gap-3 bg-ink px-4 md:flex"
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
              className="group relative flex h-12 items-center focus-visible:outline-none"
            >
              <motion.span
                layout
                layoutDependency={activeTab}
                transition={selectionHighlightTransition}
                className={`clip-slice-r absolute inset-0 ${
                  isActive ? "bg-beige" : "bg-transparent group-hover:bg-ink-light"
                }`}
              />
              <span
                className={`relative z-10 -skew-x-6 pl-5 font-ui text-lg font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? "text-ink" : "text-beige-light/80"
                }`}
              >
                {TAB_LABELS[tab]}
              </span>
              {isActive && (
                <span className="absolute left-0 top-0 z-10 h-full w-1.5 bg-accent" />
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
        className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-stretch justify-around border-t border-ink bg-ink px-1 pb-[env(safe-area-inset-bottom,0px)] md:hidden"
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
              className="relative flex min-w-[44px] flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none"
            >
              {isActive && (
                <motion.span
                  layout
                  layoutDependency={activeTab}
                  transition={selectionHighlightTransition}
                  className="absolute inset-x-2 top-1 h-1 bg-accent"
                />
              )}
              <span
                className={`font-ui text-xs font-semibold uppercase tracking-wide ${
                  isActive ? "text-beige-light" : "text-beige-light/50"
                }`}
              >
                {TAB_LABELS[tab]}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>
    </>
  );
}
