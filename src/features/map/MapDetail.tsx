import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { certificates } from "@/data/certificates";
import { repoLinks } from "@/data/links";
import { TabIcon } from "@/components/ui/TabIcon";
import { PortraitSilhouette } from "@/components/ui/PortraitSilhouette";
import { detailCrossFadeVariants } from "@/theme/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { pinById } from "@/features/map/mapNodes";
import type { TabId } from "@/store/useUIStore";

/** Segments drawn per stat row. */
const BARS = 6;

/**
 * Counts read from the content itself rather than written down here, so they
 * cannot drift out of step with what the tabs actually show. Destinations with
 * nothing meaningful to count are absent, and simply render no bar — inventing
 * a number for them would put fiction on the page.
 */
const COUNTS: Partial<Record<TabId, { label: string; value: number }>> = {
  projects: { label: "Entries", value: projects.length },
  certificates: { label: "Earned", value: certificates.length },
  repos: { label: "Public", value: repoLinks.length },
};

/**
 * Status card beside the map: who the visitor is looking at, then what the
 * highlighted destination holds.
 *
 * The identity half is fixed; only the destination half cross-fades, so moving
 * through pins does not re-animate a portrait that never changes.
 */
export function MapDetail({ selected }: { selected: TabId }) {
  const reducedMotion = usePrefersReducedMotion();
  const pin = pinById(selected);
  const count = COUNTS[selected];

  return (
    <div className="notched flex flex-col p-4 [--fill:theme(colors.p3-black.panel)]">
      {/* Identity — constant */}
      <div className="flex items-start gap-3">
        <div className="notched h-20 w-16 shrink-0 overflow-hidden [--fill:theme(colors.p3-black.raised)]">
          <PortraitSilhouette className="h-full w-full text-p3-blue" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-p3-white">
            {site.shortName}
          </h3>
          <p className="mt-1 font-ui text-xs uppercase tracking-wide text-p3-white/45">
            {site.location}
          </p>
        </div>
      </div>

      {/* Divider, in the site's diagonal language. */}
      <div aria-hidden className="my-3 flex items-center gap-2">
        <span className="h-0.5 w-10 -skew-x-12 bg-p3-red" />
        <span className="h-px flex-1 -skew-x-12 bg-p3-blue/30" />
      </div>

      {/* Destination — cross-fades with the highlight */}
      <div className="relative grid min-h-[6.5rem]">
        <AnimatePresence initial={false}>
          <motion.div
            key={selected}
            variants={detailCrossFadeVariants}
            initial={reducedMotion ? false : "initial"}
            animate="enter"
            exit="exit"
            // One grid cell for every panel, so outgoing and incoming overlap.
            style={{ gridArea: "1 / 1" }}
          >
            <div className="flex items-center gap-2">
              <TabIcon id={selected} className="h-4 w-4 shrink-0 text-p3-blue" />
              <p className="font-ui text-xs font-bold uppercase tracking-widest text-p3-blue">
                {pin.label}
              </p>
            </div>
            <p className="mt-2 font-ui text-sm text-p3-white/70">{pin.blurb}</p>

            {count && (
              <div className="mt-3 flex items-center gap-3">
                <span className="w-16 shrink-0 font-ui text-xs uppercase tracking-wide text-p3-white/50">
                  {count.label}
                </span>
                <span className="flex gap-1" aria-hidden>
                  {Array.from({ length: BARS }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-4 -skew-x-12 ${
                        i < count.value ? "bg-p3-blue" : "bg-p3-white/12"
                      }`}
                    />
                  ))}
                </span>
                <span className="font-ui text-xs font-semibold text-p3-white/70">
                  {count.value || "None yet"}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
