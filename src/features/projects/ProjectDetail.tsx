import type { Project } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";

export function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <Panel className="p-6 sm:p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Back
      </Button>
      <div className="mb-6 flex aspect-[16/7] items-center justify-center border border-ink/20 bg-beige font-ui text-sm uppercase tracking-widest text-ink/40">
        Screenshot
      </div>
      <h3 className="font-display font-bold text-2xl text-ink sm:text-3xl">
        {project.title}
      </h3>
      <p className="mt-1 font-ui text-sm text-ink-soft">{project.year}</p>
      <p className="mt-4 max-w-prose font-ui text-base text-ink-soft">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {project.link && (
          <LinkButton href={project.link} target="_blank" rel="noreferrer">
            View Live ↗
          </LinkButton>
        )}
        {project.repo && (
          <LinkButton
            variant="ghost"
            href={project.repo}
            target="_blank"
            rel="noreferrer"
          >
            Source ↗
          </LinkButton>
        )}
      </div>
    </Panel>
  );
}
