export interface SiteIdentity {
  /** Full legal name, used where formality matters. */
  fullName: string;
  /** Short form for tight typographic slots like the intro. */
  shortName: string;
  tagline: string;
  bio: string;
  email: string;
  location?: string;
}

/** One carousel frame. `alt` describes it for screen readers, `caption` is
 * shown to everyone under the image. */
export interface DemoImage {
  src: string;
  alt: string;
  caption: string;
}

/**
 * An interactive preview of a project, shown in the detail view.
 *
 * Three shapes rather than one, because the projects differ in kind: a web app
 * can be framed live, a mobile app can only be filmed, and a desktop app is
 * stills. Everything here is loaded on demand — see DemoPanel — so a project
 * with a demo costs nothing until someone asks for it.
 *
 * Every field but `type` is optional on purpose. A demo declared before its
 * files exist renders a "coming soon" state rather than broken media, which is
 * the normal case while a recording is still being made.
 */
export interface ProjectDemo {
  type: "live" | "video" | "images";
  /** `live`: the page to frame. `video`: the clip to play. */
  url?: string;
  /** `video` only. Also doubles as the probe for whether the clip exists. */
  poster?: string;
  /** `images` only. Served from `public/`, in display order. */
  images?: DemoImage[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  /** 16:9 card image, served from `public/`. Absent keeps the plain placeholder. */
  thumbnail?: string;
  link?: string;
  repo?: string;
  /**
   * The repository lives under someone else's account — a teammate's, for
   * shared coursework. Surfaces an attribution note so ownership is clear
   * before following the link rather than only on noticing the URL after.
   */
  repoOwnedByOther?: boolean;
  /** Headcount for group work. Omitted entirely for solo projects. */
  teamSize?: number;
  year?: number;
  /** Absent means the detail view renders no demo section at all. */
  demo?: ProjectDemo;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  description?: string;
  date?: string;
  /** Printed on the certificate itself; shown so a claim can be checked. */
  credentialId?: string;
  /**
   * Path to the certificate scan, served from `public/` (e.g.
   * "/certificates/ccna-itn.png"). Present means the card opens a lightbox;
   * absent means the card stays inert, so a missing file can never produce an
   * empty modal.
   */
  image?: string;
  verifyUrl?: string;
}

export interface RepoLink {
  id: string;
  name: string;
  description: string;
  url: string;
  language?: string;
  stars?: number;
}

export interface ResumeMeta {
  fileUrl: string;
  updated: string;
  previewImage?: string;
}
