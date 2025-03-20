/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TextEditor from "./TextEditor";
import { createBlogs } from "@/services/Blogs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const CreateBlog = () => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
     const router = useRouter();
  

  const handleSubmit = async () => {

    const blogData = {
      title,category,content
    }

    try {
      const res = await createBlogs(blogData)
      console.log(res)
        if (res.success) 
          {
                      toast.success(res.message);
                      router.push("/blogs/all-blogs");
                  } else {
                      toast.error(res.message);
                      console.log(res)
                  }
                     
                } catch (err: any) {
                  console.error(err);
                  toast.error("An error occurred while adding the Blog.");
              }
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-xl font-bold mb-4">Create a Blog</h1>
      <input
        type="text"
        placeholder="Title"
        className="border p-2 w-full rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Category"
        className="border p-2 w-full rounded mb-4"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <TextEditor onContentChange={setContent} />
      <Button className="mt-4" onClick={handleSubmit}>Publish</Button>
    </div>
  );
};

export default CreateBlog;
