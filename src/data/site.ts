import type { SiteIdentity } from "@/types/content";

/**
 * Single source of truth for who the site belongs to. Every component that
 * shows the name, tagline, bio, or contact reads from here — edit once.
 *
 * Deliberately no phone number: the repository is public, so anything in this
 * file is published permanently to anyone who clones it.
 */
export const site: SiteIdentity = {
  fullName: "Roberto Nicholas M. Sebastian",
  shortName: "Roberto Sebastian",
  tagline: "Aspiring DevOps Engineer · Network Engineer · SOC Analyst",
  bio: "4th-year BS Information Technology student at Ateneo de Davao University (expected graduation 2027), currently working as a Development Operations Engineer for Samahan Systems Development. Building toward a career across network engineering, SOC analysis, and IT project management.",
  email: "nikkobastian910@gmail.com",
  location: "Davao City, Philippines",
};
