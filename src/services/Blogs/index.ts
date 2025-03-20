/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { TBlog } from "@/types/blogs";
import { revalidateTag } from "next/cache";


export const createBlogs = async (Blog: TBlog) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/blogs`, {
        method: "POST",
        headers: {
        //   Authorization: (await cookies()).get("accessToken")!.value,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Blog),
      });
      revalidateTag("Blogs");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };


    // get all Blogs
export const getAllBlogs = async (page?: string,limit?:string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/blogs?limit=${limit}&page=${page}`,
        {
          next: {
            tags: ["Blogs"],
          },
        }
      );
      const data = await res.json();
      return data;
    } catch (error: any) {
      return Error(error.message);
    }
  };

  // delete Blog
  export const deleteBlog = async (
    blogId: string
  ): Promise<any> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/blogs/${blogId}`,
        {
          method: "Delete",
        
          headers: {
            // Authorization: (await cookies()).get("accessToken")!.value,
            "Content-Type": "application/json",
          },
          
        }
      );
      revalidateTag("Blogs");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };