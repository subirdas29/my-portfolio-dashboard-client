/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Input } from "../../input";
import { cn } from "@/lib/utils";

type TImageUploaderProps = {
  label?: string;
  className?: string;
  setImageFiles: React.Dispatch<React.SetStateAction<any[]>>; // changed from File[] to any[]
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>;
};

const PortfolioImageUploader = ({
  label = "Upload Images",
  className,
  setImagePreview,
  setImageFiles,
}: TImageUploaderProps) => {
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    setLoading(true);

    const API_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_API}/upload/image`;

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file); 

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          body: formData,
       
        });

        const result = await response.json();

        if (result.success) {
        
          const finalUrl = result.data;
          console.log("Uploaded URL from Backend:", finalUrl);

          setImagePreview((prev) => [...prev, finalUrl]);
          setImageFiles((prev) => [...prev, finalUrl]); 
        } else {
          console.error("Upload Error:", result.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error uploading image to backend:", error);
      }
    }

    setLoading(false);
    event.target.value = "";
  };

  return (
    <div className={cn("flex flex-col items-center w-full gap-4", className)}>
      <Input
        onChange={handleImageChange}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="image-uploader"
      />
      <label
        className="w-full h-36 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer text-center text-sm text-gray-500 hover:bg-gray-50 transition"
        htmlFor="image-uploader"
      >
        {loading ? (
          <span className="text-green-500 font-medium">Uploading...</span>
        ) : (
          label
        )}
      </label>
    </div>
  );
};

export default PortfolioImageUploader;