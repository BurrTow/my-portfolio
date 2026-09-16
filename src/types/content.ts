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

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
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
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  description?: string;
  date?: string;
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
