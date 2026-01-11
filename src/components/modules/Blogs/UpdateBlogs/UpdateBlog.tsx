/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

import TiptapEditor from "@/components/utilityComponents/editor/TiptapEditor";
import PortfolioImageUploader from "@/components/ui/core/PortfolioImageUploader";
import ImagePreviewer from "@/components/ui/core/PortfolioImageUploader/ImagePreviewer";
import TagsInput from "@/components/utilityComponents/TagInputs";

import { updateBlog } from "@/services/Blogs";
import { TBlogs } from "@/types/blogs";

const categories = [
  { name: "Technology", value: "tech" },
  { name: "Lifestyle", value: "lifestyle" },
  { name: "Web Development", value: "web-development" },
  { name: "Design", value: "design" },
  { name: "Travel", value: "travel" },
];

const UpdateBlog = ({ blog }: { blog: TBlogs}) => {
  const router = useRouter();

  // Form States (Initialized with existing blog data)
  const [title, setTitle] = useState(blog.title || "");
  const [summary, setSummary] = useState(blog.summary || "");
  const [metaTitle, setMetaTitle] = useState(blog.metadata?.title || "");
  const [metaDescription, setMetaDescription] = useState(blog.metadata?.description || "");
  const [content, setContent] = useState(blog.content || "");
  const [tags, setTags] = useState<string[]>(blog.tags || []);
  const [category, setCategory] = useState(blog.category || "");
  
  // Image state - existing image wrapped in an array
  const [featuredPreview, setFeaturedPreview] = useState<string[]>(
    blog.featuredImage ? [blog.featuredImage] : []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]); 
    console.log("Image Files:", imageFiles);

  // Validation Logic
  const validate = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    if (!summary.trim()) err.summary = "Summary is required";
    if (!metaTitle.trim()) err.metaTitle = "Meta title is required";
    if (!metaDescription.trim()) err.metaDescription = "Meta description is required";
    if (featuredPreview.length === 0) err.featured = "Featured image is required";
    if (!content || content === "<p></p>") err.content = "Blog content is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpdate = async (status: "published" | "draft") => {
    if (!blog._id) {
      toast.error("Invalid Blog ID");
      return;
    }

    if (status === "published" && !validate()) {
      toast.error("Please fix the errors before updating");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      summary,
      content,
      featuredImage: featuredPreview[0] || "",
      tags,
      category,
      metadata: {
        title: metaTitle,
        description: metaDescription,
      },
      status,
    };

    try {
      const res = await updateBlog(blog._id, payload);
      if (res.success) {
        toast.success("Blog updated successfully!");
        router.push("/blogs/all-blogs");
        router.refresh(); // To ensure layout/data is fresh
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardContent className="pt-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Update Blog</h1>

          <div className="space-y-10">
            {/* 1. Title */}
            <div>
              <Label htmlFor="title">Blog Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* 2. Featured Image */}
            <div>
              <Label>Featured Image (Cover) *</Label>
              <div className="mt-4">
                <PortfolioImageUploader
                    setImageFiles={setImageFiles}
                  setImagePreview={setFeaturedPreview}
                  label="Update cover image (Max 4MB)"
                />
                <ImagePreviewer
                  imagePreview={featuredPreview}
                    setImageFiles={setImageFiles}
                  setImagePreview={setFeaturedPreview}
                  className="flex flex-wrap gap-6 mt-6"
                />
              </div>
              {errors.featured && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.featured}
                </p>
              )}
            </div>

            {/* 3. Blog Content (Tiptap) */}
            <div>
              <Label>Blog Content *</Label>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <TiptapEditor
                  mode="write"
                  initialContent={content} 
                  onContentChange={({ html }) => setContent(html)}
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content}
                </p>
              )}
            </div>

            {/* 4. Category & Tags */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="mt-2">
                  <TagsInput value={tags} onChange={setTags} />
                </div>
              </div>
            </div>

            {/* 5. Summary */}
            <div>
              <Label>Blog Summary *</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="mt-2"
                placeholder="Short description"
              />
              <p className="text-sm text-muted-foreground mt-1">{summary.length}/200</p>
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.summary}
                </p>
              )}
            </div>

            {/* 6. SEO Metadata */}
            <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
              <div>
                <Label>SEO Meta Title *</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-2"
                  placeholder="Focus keyword title"
                />
                {errors.metaTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.metaTitle}</p>
                )}
              </div>

              <div>
                <Label>SEO Meta Description *</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={4}
                  className="mt-2"
                  placeholder="Brief SEO summary"
                />
                {errors.metaDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.metaDescription}</p>
                )}
              </div>
            </div>

            {/* 7. Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                size="lg"
                onClick={() => handleUpdate("published")}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? "Updating..." : "Update Blog"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateBlog;