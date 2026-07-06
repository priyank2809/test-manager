import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Type here",
  minHeight = "120px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, HTMLAttributes: { class: "max-w-full rounded-md my-2" } }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none text-sm text-text-primary [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand [&_a]:underline",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="rounded-lg border border-border-light overflow-hidden focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand">
      <div className="flex items-center gap-1 border-b border-border-light bg-brand-semi-white/50 px-2 py-1.5 flex-wrap">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          •≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          1≡
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={insertLink} label="Insert link">
          🔗
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} label="Insert image">
          🖼
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
        >
          ↺
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
        >
          ↻
        </ToolbarButton>
      </div>

      <div
        style={{ minHeight }}
        className="px-4 py-2.5 text-sm cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <p className="text-text-placeholder text-sm -mt-6 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-border-light mx-1" />;
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs text-text-secondary hover:bg-white transition-colors ${
        active ? "bg-white text-brand shadow-sm" : ""
      }`}
    >
      {children}
    </button>
  );
}