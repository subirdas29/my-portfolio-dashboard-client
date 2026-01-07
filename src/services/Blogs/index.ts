/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { TBlogs } from "@/types/blogs";
import { revalidateTag } from "next/cache";


export const createBlogs = async (Blog: TBlogs) => {
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


          // get single blog
export const getSingleBlog = async (blogId: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/blogs/blog/${blogId}`,
      {
        next: {
          tags: ["Blogs"],
        },
      }
    );
    const data = await res.json();
    console.log(data,'server')
    return data;
  } catch (error: any) {
    return Error(error);
  }
};

 //Update blogs
  export const updateBlog = async (
    blogId: string,
    blogData:Partial<TBlogs>,
   
  ): Promise<any> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/blogs/edit-blog/${blogId}`,
        {
          method: "PATCH",
        
          headers: {
            // Authorization: (await cookies()).get("accessToken")!.value,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blogData),
        }
      );
      revalidateTag("Blogs");
      return await res.json();
    } catch (error: any) {
      return Error(error);
    }
  };