import { motion } from "framer-motion";
import { useState } from "react";
import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { staggerContainer } from "@/theme/motion";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { ProjectDetail } from "@/features/projects/ProjectDetail";

export function ProjectsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <SectionHeading
        title="Projects"
        subtitle="A selection of things I've built, shipped, and broken along the way."
      />
      <motion.div
        initial="initial"
        animate="enter"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => setSelectedId(project.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
