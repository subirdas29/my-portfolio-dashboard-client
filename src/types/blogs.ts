export type TBlogs= {
    title: string;
    summary: string;
    content: string;
    featuredImage: string;
    tags: string[];
    categories: string[];
    metadata: {
        title: string;
        description: string;
    };
    status: "published" | "draft";
}