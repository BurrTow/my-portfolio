import { resumeMeta } from "@/data/resume";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/LinkButton";
import { Panel } from "@/components/ui/Panel";

export function ResumeTab() {
  return (
    <div>
      <SectionHeading
        title="Resume"
        subtitle={`Last updated ${resumeMeta.updated}.`}
      />
      <div className="mb-6">
        <LinkButton href={resumeMeta.fileUrl} download>
          Download PDF ↓
        </LinkButton>
      </div>
      <Panel className="overflow-hidden">
        <iframe
          src={resumeMeta.fileUrl}
          title="Resume preview"
          className="h-[70vh] w-full"
        />
      </Panel>
    </div>
  );
}
