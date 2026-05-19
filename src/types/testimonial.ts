export type TTestimonial = {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  projectName?: string;
  linkedClientId?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};
