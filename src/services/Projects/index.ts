/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"


import { TProjects } from "@/types/projects";
import { revalidateTag } from "next/cache";

export const createProjects = async (projects: TProjects) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/projects`, {
        method: "POST",
        headers: {
        //   Authorization: (await cookies()).get("accessToken")!.value,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projects),
      });
      revalidateTag("Projects");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };


  // get all projects
export const getAllProjects = async (page?: string,limit?:string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/projects?limit=${limit}&page=${page}`,
        {
          next: {
            tags: ["Projects"],
          },
        }
      );
      const data = await res.json();
      return data;
    } catch (error: any) {
      return Error(error.message);
    }
  };

// get single product
export const getSingleProject = async (projectId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/projects/project/${projectId}`,
        {
          next: {
            tags: ["Projects"],
          },
        }
      );
      const data = await res.json();
      return data;
    } catch (error: any) {
      return Error(error);
    }
  };
  

  //Update Projects
  export const updateProject = async (
    projectData:Partial<TProjects>,
    projectId: string
  ): Promise<any> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/projects/edit-project/${projectId}`,
        {
          method: "PATCH",
        
          headers: {
            // Authorization: (await cookies()).get("accessToken")!.value,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }
      );
      revalidateTag("projects");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };
  

  // delete Project
export const deleteProject = async (
    projectId: string
  ): Promise<any> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/projects/${projectId}`,
        {
          method: "Delete",
        
          headers: {
            // Authorization: (await cookies()).get("accessToken")!.value,
            "Content-Type": "application/json",
          },
          
        }
      );
      revalidateTag("Projects");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };