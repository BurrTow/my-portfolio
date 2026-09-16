import { useCallback, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { SliceTransition } from "@/components/transitions/SliceTransition";
import { IntroSequence } from "@/components/transitions/IntroSequence";
import { MaskWipe } from "@/components/transitions/MaskWipe";
import { useUIStore } from "@/store/useUIStore";
import { ProjectsTab } from "@/features/projects/ProjectsTab";
import { CertificatesTab } from "@/features/certificates/CertificatesTab";
import { ReposTab } from "@/features/links/ReposTab";
import { ResumeTab } from "@/features/resume/ResumeTab";
import { AboutTab } from "@/features/about/AboutTab";
import { MapScreen } from "@/features/map/MapScreen";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { detectTier } from "@/hooks/useDeviceTier";
import { useFrameMonitor } from "@/hooks/useFrameMonitor";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

const TAB_CONTENT = {
  projects: ProjectsTab,
  certificates: CertificatesTab,
  repos: ReposTab,
  resume: ResumeTab,
  about: AboutTab,
};

export default function App() {
  const activeTab = useUIStore((s) => s.activeTab);
  const ActiveTabContent = TAB_CONTENT[activeTab];
  const mapOpen = useUIStore((s) => s.mapOpen);
  const setMapOpen = useUIStore((s) => s.setMapOpen);
  const [introFinished, setIntroFinished] = useState(false);

  // One routing decision, taken as the intro leaves, reusing the same tier
  // detection as everything else. Desktop and capable devices land on the
  // map; small or low-tier devices land on the flat nav, already showing
  // Projects, which needs no extra step.
  const handleIntroFinish = useCallback(() => {
    setIntroFinished(true);
    const tier = detectTier();
    const roomForMap = window.innerWidth >= 768 && tier !== "low";
    if (roomForMap) setMapOpen(true);
  }, [setMapOpen]);

  useDeviceTier();
  // Held until the intro is done: its animation would otherwise land inside
  // the sampling window and be read as the device struggling.
  useFrameMonitor(introFinished);

  return (
    <>
      <IntroSequence onFinish={handleIntroFinish} />
      <MaskWipe />
      {mapOpen && <MapScreen onClose={() => setMapOpen(false)} />}
      {!mapOpen && (
        <button
          onClick={() => setMapOpen(true)}
          className={`clip-notch fixed right-4 top-4 z-30 bg-p3-blue-deep px-4 py-2 font-ui text-sm font-semibold uppercase tracking-wide text-p3-white hover:bg-p3-blue ${FOCUS_RING}`}
        >
          Map
        </button>
      )}
      <Shell>
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-desktop-${activeTab} tab-mobile-${activeTab}`}
          tabIndex={0}
        >
          <SliceTransition id={activeTab}>
            <ActiveTabContent />
          </SliceTransition>
        </div>
      </Shell>
    </>
  );
}
