import { motion } from "framer-motion";
import type { Project } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { staggerItem } from "@/theme/motion";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

export function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: () => void;
}) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Card
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`View details for ${project.title}`}
        className="h-full cursor-pointer"
      >
        <div className="mb-4 flex aspect-video items-center justify-center border border-p3-blue/25 bg-p3-black font-ui text-xs uppercase tracking-widest text-p3-white/40">
          Screenshot
        </div>
        <h3 className="font-display text-lg font-bold text-p3-white">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 font-ui text-sm text-p3-white/70">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {project.tech.slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {project.tech.length > 3 && (
            <span className="font-ui text-xs text-p3-white/50">
              +{project.tech.length - 3}
            </span>
          )}
        </div>
        {project.repoOwnedByOther && (
          <p className="mt-4 font-ui text-xs text-p3-white/40">
            Team project — repo hosted by teammate
          </p>
        )}
        {project.repo ? (
          // The card itself is the control that opens the detail view, so this
          // link has to stop the click from also triggering it.
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`mt-4 inline-block font-ui text-xs font-semibold uppercase tracking-wide text-p3-blue underline-offset-4 hover:underline ${FOCUS_RING}`}
          >
            View Repo ↗
          </a>
        ) : (
          <p className="mt-4 font-ui text-xs uppercase tracking-wide text-p3-white/50">
            Repo coming soon
          </p>
        )}
      </Card>
    </motion.div>
  );
}
