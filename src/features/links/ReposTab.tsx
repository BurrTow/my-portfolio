import { motion } from "framer-motion";
import { repoLinks } from "@/data/links";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { staggerContainer } from "@/theme/motion";
import { RepoCard } from "@/features/links/RepoCard";

export function ReposTab() {
  return (
    <div>
      <SectionHeading
        title="Repos"
        subtitle="Open-source and personal projects on GitHub."
      />
      <motion.div
        initial="initial"
        animate="enter"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {repoLinks.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </motion.div>
    </div>
  );
}
