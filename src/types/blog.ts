export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  imageUrl?: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewCount: number;
  category: string;
  featured: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  imageUrl?: string;
  tags: string[];
  published: boolean;
  category: string;
  featured: boolean;
} 