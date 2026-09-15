import { motion } from "framer-motion";
import type { RepoLink } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { staggerItem } from "@/theme/motion";

export function RepoCard({ repo }: { repo: RepoLink }) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <a href={repo.url} target="_blank" rel="noreferrer" className="block h-full">
        <Card className="h-full">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-p3-white">
              {repo.name}
            </h3>
            {typeof repo.stars === "number" && (
              <span className="font-ui text-xs text-p3-white/50">
                ★ {repo.stars}
              </span>
            )}
          </div>
          <p className="mt-2 font-ui text-sm text-p3-white/70">
            {repo.description}
          </p>
          {repo.language && (
            <div className="mt-3">
              <Tag>{repo.language}</Tag>
            </div>
          )}
        </Card>
      </a>
    </motion.div>
  );
}
