/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { TSkill } from "@/types/skills";
import { revalidateTag } from "next/cache";


export const createSkills = async (skills: TSkill) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/skills`, {
        method: "POST",
        headers: {
        //   Authorization: (await cookies()).get("accessToken")!.value,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skills),
      });
      revalidateTag("Skills");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };


    // get all skills
export const getAllSkills = async (page?: string,limit?:string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/skills?limit=${limit}&page=${page}`,
        {
          next: {
            tags: ["Skills"],
          },
        }
      );
      const data = await res.json();
      return data;
    } catch (error: any) {
      return Error(error.message);
    }
  };

    // delete Skill
export const deleteSkill = async (
    skillId: string
  ): Promise<any> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/skills/${skillId}`,
        {
          method: "Delete",
        
          headers: {
            // Authorization: (await cookies()).get("accessToken")!.value,
            "Content-Type": "application/json",
          },
          
        }
      );
      revalidateTag("Skills");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };