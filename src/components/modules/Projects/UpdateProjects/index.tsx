/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TProjects } from "@/types/projects";
import PortfolioImageUploader from "@/components/ui/core/PortfolioImageUploader";
import ImagePreviewer from "@/components/ui/core/PortfolioImageUploader/ImagePreviewer";
import { updateProject } from "@/services/Projects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectType } from "@/constant/project";

export default function UpdateProjectForm({ project }: { project: TProjects }) {
  const [imageFiles, setImageFiles] = useState<File[] | []>([]);
  const [imagePreview, setImagePreview] = useState<string[] | []>(project?.imageUrls || []);
  console.log(imageFiles)
  const router = useRouter();

  const technologies = Array.isArray(project?.technologies)
  ? project?.technologies.join(", ")
  : project?.technologies || "";

  const form = useForm({
    defaultValues: {
      title: project?.title || "",
      projectType: project?.projectType || "",
      details: project?.details || "",
      technologies,
      liveLink: project?.liveLink || "",
      clientGithubLink: project?.clientGithubLink || "",
      serverGithubLink: project?.serverGithubLink || "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<any> = async (data) => {
    const modifiedData = {
      ...data,
      imageUrls: [...imagePreview], 
      technologies: data.technologies.split(",").map((tech: string) => tech.trim()),
    };

    try {
      const res = await updateProject(modifiedData, project._id);
      if (res.success) {
        toast.success("Project updated successfully!");
        router.push("/projects/all-projects");
      } else {
        toast.error(res.message);
        console.log(res)
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-xl p-8 mx-auto container w-2xl">
      <h1 className="text-xl font-bold mb-5">Update Project</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Project Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Project Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="w-1/2">
                    <SelectTrigger>
            <SelectValue placeholder={field.value || "Select project type"} />
          </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectType.map((project, idx) => (
                        <SelectItem key={idx} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Details</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technologies"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Technologies (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="liveLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Live Project Link</FormLabel>
                <FormControl>
                  <Input type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientGithubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Client GitHub Repository</FormLabel>
                <FormControl>
                  <Input type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serverGithubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mt-4 text-primary text-md">Server GitHub Repository (Optional)</FormLabel>
                <FormControl>
                  <Input type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center border-t border-b py-3 my-5">
            <p className="text-primary font-semibold text-lg">Project Images</p>
          </div>

          <div className="flex gap-4">
            <PortfolioImageUploader
              setImageFiles={setImageFiles}
              setImagePreview={setImagePreview}
              label="Upload Image"
              className="w-1/4 mt-0"
            />
            <ImagePreviewer
              className="flex flex-wrap gap-4"
              setImageFiles={setImageFiles}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating Project..." : "Update Project"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
