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

  return (
    <>
      <IntroSequence />
      <MaskWipe />
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
