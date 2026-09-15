import { motion } from "framer-motion";
import { repoLinks } from "@/data/links";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer } from "@/theme/motion";
import { RepoCard } from "@/features/links/RepoCard";

export function ReposTab() {
  return (
    <div>
      <SectionHeading
        title="Repos"
        subtitle="Source code for the projects listed here."
      />
      {repoLinks.length === 0 ? (
        <EmptyState
          title="Repositories coming soon"
          hint="These projects' repositories aren't public yet. Links will appear here once they are."
        />
      ) : (
        <motion.div
          initial="initial"
          animate="enter"
          variants={staggerContainer}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {repoLinks.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
