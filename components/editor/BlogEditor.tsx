"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Undo, Redo } from "lucide-react";

interface BlogEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function BlogEditor({ initialContent = "", onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-80 p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = initialContent || "<p></p>";
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL de l'image :");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("URL du lien :");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Gras"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Italique"
          type="button"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Liste à puces"
          type="button"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Liste numérotée"
          type="button"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Citation"
          type="button"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          title="Lien"
          type="button"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Image"
          type="button"
        >
          <ImageIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Annuler"
          type="button"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Rétablir"
          type="button"
        >
          <Redo size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}