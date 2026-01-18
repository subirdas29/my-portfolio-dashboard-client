/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ImageUploadExtension.ts
import { Image } from "@tiptap/extension-image";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"; 
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload/image`; 

export const ImageUploadExtension = Image.extend({
  addCommands() {
    return {
      setImage: (options: { src: string }) => ({ editor, commands }) => {
        const src = options.src;
        
   
        commands.insertContent({ type: "image", attrs: { src } });

  
        if (!src.startsWith("data:image")) return true;

        (async () => {
          // ১. ইউআই-তে লোডিং মেসেজ শুরু করা
          const toastId = toast.loading("Optimizing & uploading image...");

          try {
            console.log("⏳ Processing image...");
            
            // ২. Base64 থেকে Blob এ কনভার্ট করা
            const response = await fetch(src);
            const originalFile = await response.blob();

            // ৩. কমপ্রেশন সেটিংস (WebP conversion সহ)
            const compressionOptions = {
              maxSizeMB: 0.8,           // সর্বোচ্চ ৮০০ কেবি
              maxWidthOrHeight: 1280,  // ব্লগের জন্য স্ট্যান্ডার্ড উইডথ
              useWebWorker: true,
              fileType: 'image/webp'   // WebP ফরম্যাটে রূপান্তর
            };

            // ৪. ইমেজ কমপ্রেশন কার্যকর করা
            const compressedBlob = await imageCompression(originalFile as File, compressionOptions);

            // ৫. FormData তৈরি করে ব্যাকএন্ডে পাঠানো
            const fd = new FormData();
            fd.append("file", compressedBlob, "blog-editor-image.webp");

            const res = await fetch(UPLOAD_ENDPOINT, { 
              method: "POST", 
              body: fd 
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.message || "Upload failed");
            }

            const result = await res.json();
            const finalURL = result.data; 
            
            if (!finalURL) throw new Error("Cloudinary URL not found");

            // ৬. এডিটরে থাকা Base64 ইমেজটি Cloudinary URL দিয়ে রিপ্লেস করা
            const { state, view } = editor;
            state.doc.descendants((node, pos) => {
              if (node.type.name === "image" && node.attrs?.src === src) {
                const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: finalURL });
                view.dispatch(tr);
              }
              return true;
            });

            // ৭. টোস্ট সাকসেস মেসেজে আপডেট করা
            toast.success("Image uploaded successfully!", { id: toastId });

          } catch (err: any) {
            console.error("❌ Upload error:", err);
            
            // ৮. এরর হলে টোস্ট আপডেট করা এবং এডিটর থেকে ইমেজ রিমুভ করা
            toast.error(err.message || "Failed to upload image!", { id: toastId });
            removeNode(editor, src);
          }
        })();

        return true;
      },
    };
  },
});

// ইমেজ আপলোড ফেইল হলে সেটি এডিটর থেকে ডিলিট করার ফাংশন
function removeNode(editor: any, src: string) {
  const { state, view } = editor;
  state.doc.descendants((node: any, pos: any) => {
    if (node.type.name === "image" && node.attrs?.src === src) {
      const tr = state.tr.deleteRange(pos, pos + node.nodeSize);
      view.dispatch(tr);
    }
    return true;
  });
}