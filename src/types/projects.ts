

export type TProjects = {
    _id?:string;
    title: string;
    projectType: string;
    details: string;
    technologies: string | string[]
    liveLink: string;
    clientGithubLink: string;
    serverGithubLink?: string;
    imageUrls: string[];
  };
  