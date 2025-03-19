"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import YouTube from "@tiptap/extension-youtube";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Button } from "@/components/ui/button"; // Using ShadCN UI

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      ListItem,
      BulletList,
      OrderedList,
      TaskList,
      TaskItem,
      Blockquote,
      CodeBlock,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
      Image.configure({ allowBase64: true }),
      YouTube.configure({ modestBranding: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p>Start writing...</p>",
  });

  if (!editor) return null;

  return (
    <div className="border p-4 rounded-lg w-full">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2">
        <Button onClick={() => editor.chain().focus().toggleBold().run()} variant="outline">B</Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} variant="outline">I</Button>
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()} variant="outline">U</Button>
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} variant="outline">S</Button>
        <Button onClick={() => editor.chain().focus().toggleCode().run()} variant="outline">{`</>`}</Button>
        <Button onClick={() => editor.chain().focus().setParagraph().run()} variant="outline">P</Button>
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} variant="outline">H1</Button>
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} variant="outline">H2</Button>
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} variant="outline">H3</Button>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} variant="outline">• List</Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} variant="outline">1. List</Button>
        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} variant="outline">“ Quote</Button>
        <Button onClick={() => editor.chain().focus().toggleCodeBlock().run()} variant="outline">Code</Button>
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} variant="outline">—</Button>
        <Button onClick={() => editor.chain().focus().setTextAlign("left").run()} variant="outline">L</Button>
        <Button onClick={() => editor.chain().focus().setTextAlign("center").run()} variant="outline">C</Button>
        <Button onClick={() => editor.chain().focus().setTextAlign("right").run()} variant="outline">R</Button>
        <Button onClick={() => editor.chain().focus().setTextAlign("justify").run()} variant="outline">J</Button>
        <Button onClick={() => {
          const url = prompt("Enter Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} variant="outline">🖼️</Button>
        <Button onClick={() => {
          const url = prompt("Enter YouTube URL");
          if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }} variant="outline">🎥</Button>
        <Button onClick={() => {
          const url = prompt("Enter Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} variant="outline">🔗</Button>
        <Button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} variant="outline">📊</Button>
        <Button onClick={() => editor.chain().focus().undo().run()} variant="outline">↩️</Button>
        <Button onClick={() => editor.chain().focus().redo().run()} variant="outline">↪️</Button>
        <Button onClick={() => editor.chain().focus().clearContent().run()} variant="destructive">🗑️ Clear</Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="border rounded-md p-3 min-h-[150px]" />
    </div>
  );
};

export default Editor;
