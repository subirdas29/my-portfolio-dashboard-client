

export type TProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'Deployed' | 'Archived';

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
    status?: TProjectStatus;
    startDate?: string;
    endDate?: string;
    isClientProject?: boolean;
    clientName?: string;
    clientEmail?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  