import { motion } from "framer-motion";
import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { staggerContainer, staggerItem } from "@/theme/motion";

export function AboutTab() {
  return (
    <div>
      <SectionHeading title="About" subtitle={site.tagline} />
      <motion.div
        initial="initial"
        animate="enter"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-5"
      >
        <motion.div variants={staggerItem}>
          <Card className="cursor-default">
            <h3 className="font-display text-lg font-bold text-p3-white">
              {site.fullName}
            </h3>
            <p className="mt-4 max-w-prose font-ui text-base text-p3-white/70">
              {site.bio}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="cursor-default">
            <h3 className="font-display text-lg font-bold text-p3-white">
              Contact
            </h3>
            <p className="mt-2 font-ui text-sm text-p3-white/50">
              {site.location}
            </p>
            {/* normal-case: the button treatment uppercases labels, but this
                is an address rather than a label and reads better as typed. */}
            <LinkButton
              variant="ghost"
              href={`mailto:${site.email}`}
              className="mt-4 normal-case tracking-normal"
            >
              {site.email}
            </LinkButton>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
