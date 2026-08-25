"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Strikethrough,
  Code,
} from "lucide-react";

interface BlogEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function BlogEditor({ initialContent = "", onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-80 p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Mise à jour du contenu sans réinitialiser le curseur pendant la saisie
  useEffect(() => {
    if (!editor || !initialContent) return;
    const current = editor.getHTML();
    if (current !== initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL de l'image :");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien :", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-300 dark:border-gray-700">
        {/* Titres (H2 & H3) */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-700 font-bold text-blue-600" : ""
          }`}
          title="Titre 2"
          type="button"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-700 font-bold text-blue-600" : ""
          }`}
          title="Titre 3"
          type="button"
        >
          <Heading3 size={16} />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Style de texte */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Gras"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Italique"
          type="button"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Barrer"
          type="button"
        >
          <Strikethrough size={16} />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Listes et citations */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Liste à puces"
          type="button"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Liste numérotée"
          type="button"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Citation"
          type="button"
        >
          <Quote size={16} />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Liens et images */}
        <button
          onClick={setLink}
          className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : ""
          }`}
          title="Lien"
          type="button"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Image"
          type="button"
        >
          <ImageIcon size={16} />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Historique */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
          title="Annuler"
          type="button"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
          title="Rétablir"
          type="button"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Zone d'édition */}
      <EditorContent editor={editor} />
    </div>
  );
}