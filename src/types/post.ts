export interface Blogs {
  name: string;
  banner?: string;
  description?: string;
  tags?: string[];
  date?: Date | string | number;
  path: string;
}

export interface Blog {
  metadata: BlogMetadata;
  content: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  created: Date;
  updated: Date;
  banner?: string;
  tags?: string[];
}

export interface Post {
  title: string;
  description: string;
  created: Date;
  updated: Date;
  banner?: string;
  tags?: string[];
  path: string;
}

export interface PostDetails {
  title: string;
  description: string;
  banner?: string;
  tags?: string[];
  content: string;
  created: Date;
  updated: Date;
}
