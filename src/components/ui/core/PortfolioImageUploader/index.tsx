/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Input } from "../../input";
import { cn } from "@/lib/utils";
import imageCompression from 'browser-image-compression'; 

type TImageUploaderProps = {
  label?: string;
  className?: string;
  setImageFiles: React.Dispatch<React.SetStateAction<any[]>>;
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

    // Compression Options
    const options = {
      maxSizeMB: 1,           
      maxWidthOrHeight: 1920, 
      useWebWorker: true,
      fileType: 'image/webp'  
    };

    for (const file of fileArray) {
      try {
        // 1. Image compress kora (Client-side e)
        console.log(`Original: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const compressedBlob = await imageCompression(file, options);
        
        // 2. Blob ke File object e convert kora (Backend pathanor jonno)
        const compressedFile = new File(
          [compressedBlob], 
          file.name.replace(/\.[^/.]+$/, ".webp"), 
          { type: 'image/webp' }
        );

        console.log(`Compressed: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`);

        // 3. FormData te compressed file add kora
        const formData = new FormData();
        formData.append("file", compressedFile); 

        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const finalUrl = result.data;
          setImagePreview((prev) => [...prev, finalUrl]);
          setImageFiles((prev) => [...prev, finalUrl]); 
        } else {
          console.error("Upload Error:", result.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error processing/uploading image:", error);
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
          <div className="flex flex-col items-center gap-2">
            <span className="animate-pulse text-green-500 font-medium">Compressing & Uploading...</span>
          </div>
        ) : (
          label
        )}
      </label>
    </div>
  );
};

export default PortfolioImageUploader;