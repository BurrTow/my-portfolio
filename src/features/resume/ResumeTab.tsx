import { useEffect, useState } from "react";
import { resumeMeta } from "@/data/resume";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/LinkButton";
import { Panel } from "@/components/ui/Panel";

/** Below this, the embed is skipped entirely — see the note on the preview. */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function ResumeTab() {
  // A media query rather than a CSS `hidden` class: a hidden iframe still
  // fetches the PDF, and most mobile browsers cannot render one inline
  // anyway — they would download it or show an empty box.
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div>
      <SectionHeading
        title="Resume"
        subtitle={`Last updated ${resumeMeta.updated}.`}
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <LinkButton href={resumeMeta.fileUrl} download>
          Download PDF ↓
        </LinkButton>
        <LinkButton
          variant="ghost"
          href={resumeMeta.fileUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in new tab ↗
        </LinkButton>
      </div>
      {isDesktop && (
        <Panel className="overflow-hidden">
          <iframe
            src={resumeMeta.fileUrl}
            title="Resume preview"
            loading="lazy"
            className="h-[70vh] w-full"
          />
        </Panel>
      )}
    </div>
  );
}
