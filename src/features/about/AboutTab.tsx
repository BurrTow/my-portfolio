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
            {/* Stacks on a phone so the emblem never squeezes the bio into a
                narrow column. */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* aria-hidden: the monogram is decorative — the full name sits
                  in the heading right beside it. */}
              <div
                aria-hidden
                className="notched flex h-36 w-28 shrink-0 flex-col items-center justify-center gap-3 [--fill:theme(colors.p3-black.raised)]"
              >
                <span className="-skew-x-6 font-display text-5xl font-bold leading-none text-p3-blue">
                  RS
                </span>
                <span className="h-0.5 w-8 -skew-x-12 bg-p3-red" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold text-p3-white sm:text-2xl">
                  {site.fullName}
                </h3>
                {site.location && (
                  <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/45">
                    {site.location}
                  </p>
                )}
                <div aria-hidden className="my-4 flex items-center gap-2">
                  <span className="h-0.5 w-10 -skew-x-12 bg-p3-red" />
                  <span className="h-px flex-1 -skew-x-12 bg-p3-blue/30" />
                </div>
                <p className="max-w-prose font-ui text-base text-p3-white/70">
                  {site.bio}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="cursor-default">
            <h3 className="font-display text-lg font-bold text-p3-white">
              Contact
            </h3>
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
