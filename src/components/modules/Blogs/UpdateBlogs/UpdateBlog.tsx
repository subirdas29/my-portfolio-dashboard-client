/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TextEditor from "../AddBlogs/TextEditor";
import { TBlog } from "@/types/blogs";
import { updateBlog } from "@/services/Blogs";

const UpdateBlog = ({ blog }:{blog:TBlog}) => {
  const [content, setContent] = useState(blog.content || "");
  const [title, setTitle] = useState(blog.title || "");
  const [category, setCategory] = useState(blog.category || "");
  const router = useRouter();

  // Handle Update
  const handleUpdate = async () => {
    if (!blog._id) {
      toast.error("Invalid Blog ID");
      return;
    }

    const updatedBlog = { title, category, content };

    try {
        console.log(updatedBlog)
      const res = await updateBlog( blog._id, updatedBlog);
      if (res.success) {
        toast.success("Blog updated successfully!");
        router.push("/blogs/all-blogs"); // Redirect after update
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error updating the blog.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <h1 className="text-xl font-bold mb-4">Update Blog</h1>

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
      <TextEditor onContentChange={setContent} initialContent={content} />
      <Button className="mt-4" onClick={handleUpdate}>
        Update Blog
      </Button>
    </div>
  );
};

export default UpdateBlog;
