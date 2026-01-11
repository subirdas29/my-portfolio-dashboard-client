export type TBlogs= {
    _id?:string;
    title: string;
    slug: string;
  content: string;
  summary?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  meta?: {
    views: number;
    likes: number;
  };
  metadata: {
    title: string;
    description: string;
  };
  createdAt?:Date

}