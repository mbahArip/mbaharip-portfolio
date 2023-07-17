export interface PostDetails {
  content: string;
  metadata: Metadata;
}

export interface PostToC {
  level: number;
  text: string;
  slug: string;
}

export interface Metadata {
  title: string;
  summary: string;
  thumbnail?: string;
  thumbnail_x: number;
  thumbnail_y: number;
  tags: string[];
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  path?: string;
}

export interface Post extends Metadata {}
