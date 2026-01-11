/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Textarea import koro
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
import TiptapEditor from "@/components/utilityComponents/editor/TiptapEditor";
import TagsInput from "@/components/utilityComponents/TagInputs";

export default function AddProjectForm() {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const router = useRouter();

    const form = useForm<TProjects>({
        defaultValues: {
            title: "",
            shortDescription: "",
            projectType: "Full-Stack",
            details: "",
            keyFeatures: "",
            liveLink: "",
            clientGithubLink: "",
            serverGithubLink: "",
            technologies: [],
            imageUrls: []
        }
    });

    const { formState: { isSubmitting }, watch } = form;
    
    // Character count track korar jonno (optional)
    const shortDescriptionValue = watch("shortDescription") || "";

    const onSubmit: SubmitHandler<TProjects> = async (data) => {
        try {
            const projectData: TProjects = {
                ...data,
                imageUrls: imagePreview, 
                technologies: tags
            };

            const res = await createProjects(projectData);
            
            if (res.success) {
                toast.success(res.message);
                router.push("/projects/all-projects");
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            console.error(err);
            toast.error("An error occurred while adding the project.");
        }
    };

    return (
        <div className="border-2 border-gray-300 rounded-xl p-5 bg-white shadow-sm">
            <h1 className="text-xl font-bold mb-6">Add New Project</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Title */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Title <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter project title" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Short Description - Textarea with 60 char limit */}
                        <FormField control={form.control} name="shortDescription" render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Short Description <span className="text-red-500">*</span></FormLabel>
                                    <span className={`text-xs ${shortDescriptionValue.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {shortDescriptionValue.length}/60
                                    </span>
                                </div>
                                <FormControl>
                                    <Textarea 
                                        {...field} 
                                        placeholder="Briefly describe your project (max 60 chars)" 
                                        maxLength={60}
                                        className="resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Project Type */}
                        <FormField control={form.control} name="projectType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Type <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {projectType.map((type, idx) => (
                                            <SelectItem key={idx} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Details */}
                        <FormField control={form.control} name="details" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Details <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div className="border rounded-lg overflow-hidden min-h-[200px]">
                                        <TiptapEditor
                                            mode="write"
                                            initialContent={field.value} 
                                            onContentChange={({ html }) => field.onChange(html)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {/* Key Features */}
                           <FormField control={form.control} name="keyFeatures" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key Features <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div className="border rounded-lg overflow-hidden min-h-[200px]">
                                        <TiptapEditor
                                            mode="write"
                                            initialContent={field.value} 
                                            onContentChange={({ html }) => field.onChange(html)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />


                        {/* Technologies */}
                        <FormField control={form.control} name="technologies" render={() => (
                            <FormItem>
                                <FormLabel>Technologies <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <TagsInput value={tags} onChange={setTags} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="liveLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Live Link <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="clientGithubLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client GitHub</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://github.com/..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="serverGithubLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Server GitHub</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://github.com/..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="my-8 p-4 border rounded-xl bg-gray-50">
                        <p className="text-primary font-bold text-lg mb-4 flex items-center gap-1">
                            Project Images <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-col md:flex-row gap-6">
                            <PortfolioImageUploader
                                setImageFiles={setImageFiles}
                                setImagePreview={setImagePreview}
                                label="Upload Project Images"
                                className="w-full md:w-1/3 mt-0"
                            />
                            <ImagePreviewer
                                className="flex flex-wrap gap-4 flex-1"
                                setImageFiles={setImageFiles}
                                imagePreview={imagePreview}
                                setImagePreview={setImagePreview}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isSubmitting}>
                        {isSubmitting ? "Creating Project..." : "Create Project"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}