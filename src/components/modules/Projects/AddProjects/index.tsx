/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import ImagePreviewer from "@/components/ui/core/PortfolioImageUploader/ImagePreviewer";
import { TProjects } from "@/types/projects";
import PortfolioImageUploader from "@/components/ui/core/PortfolioImageUploader";
import { createProjects } from "@/services/Projects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectType } from "@/constant/project";

export default function AddProjectForm() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const router = useRouter();

    const form = useForm<TProjects>();
    const { formState: { isSubmitting } } = form;

    const onSubmit: SubmitHandler<TProjects> = async (data) => {
        try {
            const uploadedImageUrls = imageFiles.map((file) => (typeof file === "string" ? file : ""))
                .filter((url) => url !== "");
               

            const projectData: TProjects = {
                ...data,
                imageUrls: uploadedImageUrls,
            };

            // Replace with actual API call to create the project
            console.log("Project Data:", projectData);
            const res = await createProjects(projectData);
            console.log(res,'resdata')
            if (res.success) {
                toast.success(res.message);
                router.push("/projects/all-projects");
            } else {
                toast.error(res.message);
                console.log(res)
            }
        } catch (err: any) {
            console.error(err);
            toast.error("An error occurred while adding the project.");
        }
    };

    return (
        <div className="border-2 border-gray-300 rounded-xl p-5 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-5">Add New Project</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="projectType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Type</FormLabel>
                                <FormControl>
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
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="details" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Details</FormLabel>
                                <FormControl>
                                    <Textarea {...field} className="resize-none h-36" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="keyFeatures" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key Features</FormLabel>
                                <FormControl>
                                    <Textarea {...field} 
                                    className="resize-none h-24"
                                    placeholder="Enter Key Features, separated by commas"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="technologies" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Technologies</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter technologies, separated by commas"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                      

                        <FormField control={form.control} name="liveLink" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Live Link</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="clientGithubLink" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client GitHub Link</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="serverGithubLink" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Server GitHub Link</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="my-5">
                        <div className="flex justify-between items-center border-t border-b py-3 my-5">
                            <p className="text-primary font-bold text-xl">Images</p>
                        </div>
                        <div className="flex gap-4">
                            <PortfolioImageUploader
                                setImageFiles={setImageFiles}
                                setImagePreview={setImagePreview}
                                label="Upload Image"
                                className="w-1/3 mt-0"
                            />
                            <ImagePreviewer
                                className="flex flex-wrap gap-4"
                                setImageFiles={setImageFiles}
                                imagePreview={imagePreview}
                                setImagePreview={setImagePreview}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="mt-5 w-full text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Adding Project..." : "Add Project"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}