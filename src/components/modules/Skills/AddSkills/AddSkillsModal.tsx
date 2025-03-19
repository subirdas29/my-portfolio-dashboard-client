/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import {  useState } from "react";
import { toast } from "sonner";


import PortfolioImageUploader from "@/components/ui/core/PortfolioImageUploader";
import ImagePreviewer from "@/components/ui/core/PortfolioImageUploader/ImagePreviewer";
import { createSkills } from "@/services/Skills";
import { TSkill } from "@/types/skills";




const CreateSkillModal = () => {
  const [imageFiles, setImageFiles] = useState<File[] | []>([]);
  const [imagePreview, setImagePreview] = useState<string[] | []>([]);
const [open, setOpen] = useState(false)

  const form = useForm();

  const {
    formState: { isSubmitting },
  } = form || {};

  console.log(imageFiles,"imageFiles")



  const onSubmit: SubmitHandler<FieldValues> = async (data) => {

    try {
        const addSkill: TSkill = {
           
            title: data.title, 
            logo: imagePreview, 
        }

      console.log(addSkill,'skill added')


      const res = await createSkills(addSkill)


      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
        console.log(res)
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
     <DialogTrigger asChild>
        <Button size="sm">Create Skill</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center">
          {imagePreview?.length > 0 ? (
            <ImagePreviewer
            className="flex flex-wrap gap-4"
              setImageFiles={setImageFiles}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
          ) : (
            <PortfolioImageUploader
              setImageFiles={setImageFiles}
              setImagePreview={setImagePreview}
              label="Upload Your Profile Photo"
              className="w-xs  mt-0"
            />
          )}
        </div>

        <Form {...form}>
          <form
            className=" gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  
                  <FormLabel className="mt-4 text-primary text-md">Skill Name</FormLabel>
                  
                  <FormControl>
                  <Input {...field} />
                </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
         

            <Button type="submit" className="w-full rounded-sm my-4">
            {isSubmitting ? "Creating...." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSkillModal ;