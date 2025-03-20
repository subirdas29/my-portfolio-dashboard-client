"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TextEditor = ({ onContentChange }: { onContentChange: (content: string) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension, Underline, Highlight],
    content: "<p>Start writing...</p>",
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  // Ensure images update properly
  useEffect(() => {
    if (editor) {
      onContentChange(editor.getHTML());
    }
  }, [images, editor, onContentChange]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editor) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await response.json();
        newImages.push(data.secure_url);
      } catch (error) {
        console.error("Image upload failed", error);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]); // Update state first

      setTimeout(() => {
        newImages.forEach((src) => {
          editor.chain().focus().setImage({ src }).run();
        });

        onContentChange(editor.getHTML());
      }, 100);
    }

    setIsUploading(false);
  };

  const deleteImage = (src: string) => {
    setImages((prevImages) => prevImages.filter((image) => image !== src));

    setTimeout(() => {
      if (editor) {
        let content = editor.getHTML();
        content = content.replace(new RegExp(`<img[^>]+src=["']${src}["'][^>]*>`, "g"), "");
        editor.commands.setContent(content);
        onContentChange(content);
      }
    }, 100);
  };

  return (
    <div className="border p-4 rounded-lg w-full">
      <div className="mb-2 flex flex-wrap gap-2">
        <Button onClick={() => editor?.chain().focus().toggleBold().run()} className={cn("border", { "bg-gray-400": editor?.isActive("bold") })}>
          B
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleItalic().run()} className={cn("border", { "bg-gray-400": editor?.isActive("italic") })}>
          I
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={cn("border", { "bg-gray-400": editor?.isActive("underline") })}>
          U
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleStrike().run()} className={cn("border", { "bg-gray-400": editor?.isActive("strike") })}>
          Del
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleHighlight().run()} className={cn("border", { "bg-gray-400": editor?.isActive("highlight") })}>
          H
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={cn("border", { "bg-gray-400": editor?.isActive("bulletList") })}>
          • List
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={cn("border", { "bg-gray-400": editor?.isActive("orderedList") })}>
          1. List
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={cn("border", { "bg-gray-400": editor?.isActive("blockquote") })}>
          ❝ Quote
        </Button>
        <Button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={cn("border", { "bg-gray-400": editor?.isActive("codeBlock") })}>
          # Code
        </Button>

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
        <Button variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
          {isUploading ? "Uploading..." : "📷 Add Image"}
        </Button>
      </div>

      <EditorContent editor={editor} className="prose max-w-none border rounded-md p-3 min-h-[150px]" />

      <div className="mt-4 flex flex-wrap gap-3">
        {images.length > 0 &&
          images.map((src) => (
            <div key={src} className="relative group">
              <Image src={src} alt="Uploaded" width={128} height={128} className="w-32 h-32 object-cover rounded-lg cursor-pointer" unoptimized onClick={() => window.open(src, "_blank")} />
              <button onClick={() => deleteImage(src)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                <X size={16} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TextEditor;
