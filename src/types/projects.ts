

export type TProjects = {
    _id?:string;
    title: string;
    slug: string;
    shortDescription: string;
    projectType: string;
   details: string;
  keyFeatures: string; 
  technologies: string[]; 
    liveLink: string;
    clientGithubLink?: string;
    serverGithubLink?: string;
    imageUrls: string[];
  };
  