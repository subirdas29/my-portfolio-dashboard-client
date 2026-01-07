// components/TagsInput.tsx
"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagsInput({ value, onChange }: TagsInputProps) {
  const [input, setInput] = useState("");

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-12 items-center">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-primary/10 text-amber-700 px-3 py-1 rounded-full text-sm"
        >
          {tag}
          <button onClick={() => removeTag(tag)} type="button">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder="Type tag and press Enter..."
        className="flex-1 outline-none min-w-40"
      />
    </div>
  );
}