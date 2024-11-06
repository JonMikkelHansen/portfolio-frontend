// Base interfaces
interface StrapiAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface MediaFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

// Thumbnail related
interface ThumbnailItem {
  id: number;
  url: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
}

// Company type for Strapi v5
export interface Company extends StrapiAttributes {
  id: number;
  documentId: string;
  Name: string;
}

// Main Case type
export interface Case {
  id: number;
  Title: string;
  Format: 'Square' | 'Wide';
  Description?: any[];
  Headline_media?: any;
  Thumbnails?: { url: string }[];
  Company?: {
    id: number;
    Name: string;
    Logo?: { url: string }[];
  };
  Date: string | null;
  Extra_media: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Response type
export interface CaseResponse {
  data: Case[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
