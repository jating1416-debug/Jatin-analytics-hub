'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import MediaPicker from '@/components/admin/MediaPicker';

// ============================================================
// MODERN RICH EDITOR (TipTap) — RichTextEditor.tsx ka replacement
// - Purane document.execCommand ki jagah proper TipTap engine
// - Image button ab Media Library kholta hai (library se pick ya
//   naya upload — drag-drop bhi) — pehle sirf URL prompt tha
// - Same contract: value (HTML string) in, onChange(html) out
//   → ArticleEditor.tsx mein sirf import line badalni hai, baaki kuch nahi
// ============================================================

export default function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { style: 'max-width:100%;border-radius:8px;margin:10px 0;' } }),
      Placeholder.configure({ placeholder: 'Blogger jaisa — yahan type karo... (Bold ke liye select karke B dabao)' }),
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-editor',
      },
    },
  });

  // parent se value badle (draft load / tab switch) -> editor sync
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean): React.CSSProperties => ({
    minWidth: 30, height: 30, padding: '0 8px',
    background: active ? 'var(--gradient)' : 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8, color: active ? '#fff' : 'var(--text-dark)', cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
  });

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Link URL (https://...):', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const callout = (label: string, color: string, bg: string) => {
    editor.chain().focus().insertContent(
      `<div class="callout" style="border-radius:10px;padding:14px 18px;margin:18px 0;border-left:4px solid ${color};background:${bg}"><b>${label}</b><br/>Yahan likho...</div><p></p>`
    ).run();
  };

  return (
    <div className="rte">
      {/* TOOLBAR */}
      <div className="rte-toolbar">
        <button style={btn(false)} title="Undo" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().undo().run()}><i className="fas fa-undo" /></button>
        <button style={btn(false)} title="Redo" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().redo().run()}><i className="fas fa-redo" /></button>
        <span className="rte-sep" />
        <button style={btn(editor.isActive('bold'))} title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button style={btn(editor.isActive('italic'))} title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button style={btn(editor.isActive('underline'))} title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <button style={btn(editor.isActive('strike'))} title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
        <span className="rte-sep" />
        <button style={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button style={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button style={btn(editor.isActive('blockquote'))} title="Quote" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <span className="rte-sep" />
        <button style={btn(editor.isActive('bulletList'))} title="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</button>
        <button style={btn(editor.isActive('orderedList'))} title="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</button>
        <span className="rte-sep" />
        <button style={btn(editor.isActive('link'))} title="Link" onMouseDown={(e) => e.preventDefault()} onClick={setLink}>🔗</button>
        <button style={btn(false)} title="Remove link" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().unsetLink().run()}>🔗✕</button>
        <button style={btn(editor.isActive('code'))} title="Inline code" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()}>&lt;/&gt;</button>
        <button style={btn(editor.isActive('codeBlock'))} title="Code block" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>▦/&gt;</button>
        <span className="rte-sep" />
        {/* IMAGE — ab Media Library modal khulta hai (library pick + drag-drop upload) */}
        <button style={btn(false)} title="Image (Media Library)" onMouseDown={(e) => e.preventDefault()} onClick={() => setPickerOpen(true)}>🖼️</button>
        <button
          style={btn(false)} title="Table" onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}
        >▦</button>
        <span className="rte-sep" />
        <button style={btn(false)} title="💡 Tip box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('💡 Tip', '#10b981', 'rgba(16,185,129,0.10)')}>💡</button>
        <button style={btn(false)} title="📝 Note box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('📝 Note', '#667eea', 'rgba(102,126,234,0.10)')}>📝</button>
        <button style={btn(false)} title="⚠️ Warning box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('⚠️ Warning', '#f59e0b', 'rgba(245,158,11,0.12)')}>⚠️</button>
        <span className="rte-sep" />
        <input
          type="color"
          title="Text color"
          style={{ width: 32, height: 30, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', padding: 0 }}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
        <button style={btn(false)} title="Clear formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>🧹</button>
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />

      <div className="rte-hint">
        ✍️ Yahan type karo — HTML <b>apne aap</b> banta hai. <b>HTML tab</b> mein source dekho/edit karo, <b>Preview tab</b> mein final look. Image button ab seedha Media Library kholta hai.
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onInsert={(url) => editor.chain().focus().setImage({ src: url }).run()}
      />
    </div>
  );
}
