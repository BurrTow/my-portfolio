import type { Project } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { PendingLabel } from "@/components/ui/PendingLabel";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { projectCredit } from "@/features/projects/projectCredit";

export function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const credit = projectCredit(project);

  return (
    <Panel className="p-6 sm:p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Back
      </Button>
      <div className="mb-6 flex aspect-[16/7] items-center justify-center border border-p3-blue/25 bg-p3-black font-ui text-sm uppercase tracking-widest text-p3-white/40">
        Screenshot
      </div>
      <h3 className="relative inline-block font-display text-2xl font-bold text-p3-white sm:text-3xl">
        {project.title}
      </h3>
      {project.year && (
        <p className="mt-1 font-ui text-sm text-p3-white/50">{project.year}</p>
      )}
      <p className="mt-4 max-w-prose font-ui text-base text-p3-white/70">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      {credit && (
        <p className="mt-4 font-ui text-sm text-p3-white/40">{credit}</p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {project.link && (
          <LinkButton href={project.link} target="_blank" rel="noreferrer">
            View Live ↗
          </LinkButton>
        )}
        {project.repo ? (
          <LinkButton
            variant="ghost"
            href={project.repo}
            target="_blank"
            rel="noreferrer"
          >
            Source ↗
          </LinkButton>
        ) : (
          <PendingLabel>Repo coming soon</PendingLabel>
        )}
      </div>
    </Panel>
  );
}
