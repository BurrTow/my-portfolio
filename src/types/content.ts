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
