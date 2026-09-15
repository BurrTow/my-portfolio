export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  thumbnail?: string;
  link?: string;
  repo?: string;
  year: number;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
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
