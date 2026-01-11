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

import { createBlogs } from "@/services/Blogs";

const categories = [
  { name: "Technology", value: "tech" },
  { name: "Lifestyle", value: "lifestyle" },
  { name: "Web Development", value: "web-development" },
  { name: "Design", value: "design" },
  { name: "Travel", value: "travel" },
];

export default function CreateBlog() {
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("");


  const [featuredPreview, setFeaturedPreview] = useState<string[]>([]);  
  const [imageFiles, setImageFiles] = useState<File[]>([]); 

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const submit = async (status: "published" | "draft") => {
    if (status === "published" && !validate()) {
      toast.error("Please fix the errors before publishing");
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
      const res = await createBlogs(payload);
   
      if (res.success) {
        toast.success(status === "draft" ? "Draft saved successfully!" : "Blog published!");
        router.push("/blogs/all-blogs");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardContent className="pt-8">
          <h1 className="text-3xl font-bold mb-8">Create New Blog</h1>

          <div className="space-y-10">
            {/* 1. Title */}
            <div>
              <Label htmlFor="title">Blog Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
                placeholder="Enter a catchy title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* 2. Featured Image (Using Backend Uploader) */}
            <div>
              <Label>Featured Image (Cover) *</Label>
              <div className="mt-4">
                <PortfolioImageUploader
                
                  setImageFiles={setImageFiles}
                  setImagePreview={setFeaturedPreview}
                  label="Click to upload cover image (Max 4MB)"
                />

              <ImagePreviewer
  imagePreview={featuredPreview}
  setImagePreview={setFeaturedPreview}
  setImageFiles={setImageFiles}
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
                placeholder="Short description of the blog"
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
              {/* <Button
                variant="outline"
                size="lg"
                onClick={() => submit("draft")}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Processing..." : "Save as Draft"}
              </Button> */}
              <Button
                size="lg"
                onClick={() => submit("published")}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? "Publishing..." : "Publish Blog"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}