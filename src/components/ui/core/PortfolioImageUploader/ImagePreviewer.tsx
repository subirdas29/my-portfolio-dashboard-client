import Image from "next/image";
import React from "react";
import { Button } from "../../button";
import { X } from "lucide-react";

type TImagePreviewer = {

  imagePreview: string[]; 
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
};

const ImagePreviewer = ({
  imagePreview,
  setImagePreview,
  className,
}: TImagePreviewer) => {
  
  const handleRemove = (index: number) => {
  
    setImagePreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className={className}>
      {imagePreview.map((preview, index) => (
        <div
          key={index}
          className="relative w-36 h-36 md:w-48 md:h-48 rounded-md overflow-hidden border border-dashed border-gray-300 shadow-sm"
        >
          <Image
            width={500}
            height={500}
            src={preview}
            alt={`Preview ${index + 1}`}
            className="object-cover w-full h-full"
          />
         
          <Button
            type="button"
            size="sm"
            onClick={() => handleRemove(index)}
            className="bg-red-500 hover:bg-red-600 absolute top-1 right-1 w-6 h-6 p-0 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewer;