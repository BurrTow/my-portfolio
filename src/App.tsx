import { useEffect, useState } from "react";
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
import { usePerfStore } from "@/store/usePerfStore";
import { useDeviceTier } from "@/hooks/useDeviceTier";
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
  const mapEnabled = usePerfStore((s) => s.mapEnabled);
  const [mapOpen, setMapOpen] = useState(false);

  useDeviceTier();
  useFrameMonitor();

  // A downgrade can switch the map off while it is open; close it rather than
  // leaving the user stranded in a screen that no longer exists.
  useEffect(() => {
    if (!mapEnabled) setMapOpen(false);
  }, [mapEnabled]);

  return (
    <>
      <IntroSequence />
      <MaskWipe />
      {mapEnabled && mapOpen && <MapScreen onClose={() => setMapOpen(false)} />}
      {mapEnabled && !mapOpen && (
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
