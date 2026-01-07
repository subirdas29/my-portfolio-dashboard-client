// components/ImageUploadExtension.ts
import { Image } from "@tiptap/extension-image";
import { toast } from "sonner";

// আপনার ব্যাকএন্ড চেক করুন: ৫০০০ পোর্ট কি চালু আছে? 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"; 
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload/image`; 

export const ImageUploadExtension = Image.extend({
  addCommands() {
    return {
      setImage: (options: { src: string }) => ({ editor, commands }) => {
        const src = options.src;
        commands.insertContent({ type: "image", attrs: { src } });

        if (!src.startsWith("data:image")) return true;

        (async () => {
          try {
            console.log("⏳ Uploading image to backend...");
            const blob = await fetch(src).then((r) => r.blob());

            if (blob.size > MAX_SIZE) {
              toast.error("Image must be smaller than 10MB!");
              removeNode(editor, src);
              return;
            }

            const fd = new FormData();
            fd.append("file", blob, "editor-blog-img.webp");

            const res = await fetch(UPLOAD_ENDPOINT, { 
              method: "POST", 
              body: fd 
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.message || "Upload failed");
            }

            const data = await res.json();
            
            
            console.log("✅ Cloudinary Response Data:", data);
            
            const finalURL = data.data; 
            console.log("🚀 Final Image URL:", finalURL);

            if (!finalURL) throw new Error("No URL found in response");

            const { state, view } = editor;
            state.doc.descendants((node, pos) => {
              if (node.type.name === "image" && node.attrs?.src === src) {
                const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: finalURL });
                view.dispatch(tr);
              }
              return true;
            });

            toast.success("Image uploaded to Cloudinary!");
          } catch (err: any) {
            console.error("❌ Image upload error:", err);
            toast.error(err.message || "Connection refused to backend!");
            removeNode(editor, src);
          }
        })();

        return true;
      },
    };
  },
});


function removeNode(editor: any, src: string) {
  const { state, view } = editor;
  state.doc.descendants((node:any, pos:any) => {
    if (node.type.name === "image" && node.attrs?.src === src) {
      const tr = state.tr.deleteRange(pos, pos + node.nodeSize);
      view.dispatch(tr);
    }
    return true;
  });
}