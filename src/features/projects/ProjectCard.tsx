import { motion } from "framer-motion";
import type { Project } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { staggerItem } from "@/theme/motion";

export function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: () => void;
}) {
  return (
    <motion.div variants={staggerItem}>
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
        className="cursor-pointer"
      >
        <div className="mb-3 flex aspect-video items-center justify-center border border-ink/20 bg-beige font-ui text-xs uppercase tracking-widest text-ink/40">
          Screenshot
        </div>
        <h3 className="font-display font-bold text-lg text-ink">{project.title}</h3>
        <p className="mt-2 line-clamp-2 font-ui text-sm text-ink-soft">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {project.tech.slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {project.tech.length > 3 && (
            <span className="font-ui text-xs text-ink/40">
              +{project.tech.length - 3}
            </span>
          )}
        </div>
        {!project.repo && (
          <p className="mt-3 font-ui text-xs uppercase tracking-wide text-ink/40">
            Repo coming soon
          </p>
        )}
      </Card>
    </motion.div>
  );
}
