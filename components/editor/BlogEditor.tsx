"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Undo, Redo } from "lucide-react";

interface BlogEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function BlogEditor({ initialContent = "", onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("URL de l'image :");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = prompt("URL du lien :");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Gras"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Italique"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Liste à puces"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Liste numérotée"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Citation"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Lien"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Annuler"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Rétablir"
        >
          <Redo size={16} />
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 prose prose-sm sm:prose dark:prose-invert max-w-none" />
    </div>
  );
}