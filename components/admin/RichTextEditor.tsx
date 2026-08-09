'use client';

import { useEffect, useRef } from 'react';

// ============================================================
// BLOGGER-STYLE WYSIWYG RICH EDITOR (100% free, koi library nahi)
// - Type karo normal English → HTML apne aap banta hai
// - Toolbar: Bold/Italic/H2/H3/Lists/Link/Code/Table/Callouts/Color...
// - HTML tab mein generated source dekho (ArticleEditor ke saath)
// - contenteditable + execCommand (sab browsers mein chalta hai)
// ============================================================

const exec = (cmd: string, val?: string) => {
  try { document.execCommand(cmd, false, val); } catch {}
};

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastRef = useRef(value);

  // parent se value aaye (tab switch / draft load) → editor sync
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
      lastRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    if (html !== lastRef.current) {
      lastRef.current = html;
      onChange(html);
    }
  };

  const insertHTML = (html: string) => {
    exec('insertHTML', html);
    onInput();
  };

  const link = () => {
    const url = window.prompt('Link URL (https://...):', 'https://');
    if (url) { exec('createLink', url); onInput(); }
  };

  const image = () => {
    const url = window.prompt('Image URL:', 'https://');
    if (url) {
      insertHTML(`<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:10px 0;" />`);
    }
  };

  const callout = (type: string, label: string, color: string, bg: string) => {
    insertHTML(
      `<div class="callout callout-${type}" style="border-radius:10px;padding:14px 18px;margin:18px 0;border-left:4px solid ${color};background:${bg}"><b>${label}</b><br/>Yahan likho...</div>`
    );
  };

  const pastePlain = async () => {
    try {
      const text = await navigator.clipboard.readText();
      exec('insertText', text);
      onInput();
    } catch {
      alert('Browser paste block kar raha hai — Ctrl+Shift+V se plain text paste karo.');
    }
  };

  const btn: React.CSSProperties = {
    minWidth: 30, height: 30, padding: '0 8px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-dark)', cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
  };

  return (
    <div className="rte">
      {/* TOOLBAR */}
      <div className="rte-toolbar">
        <button style={btn} title="Undo" onClick={() => { exec('undo'); onInput(); }}><i className="fas fa-undo" /></button>
        <button style={btn} title="Redo" onClick={() => { exec('redo'); onInput(); }}><i className="fas fa-redo" /></button>
        <span className="rte-sep" />
        <button style={btn} title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('bold'); onInput(); }}><b>B</b></button>
        <button style={btn} title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('italic'); onInput(); }}><i>I</i></button>
        <button style={btn} title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('underline'); onInput(); }}><u>U</u></button>
        <button style={btn} title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('strikeThrough'); onInput(); }}><s>S</s></button>
        <span className="rte-sep" />
        <button style={btn} title="Heading 2" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('formatBlock', '<h2>'); onInput(); }}>H2</button>
        <button style={btn} title="Heading 3" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('formatBlock', '<h3>'); onInput(); }}>H3</button>
        <button style={btn} title="Quote" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('formatBlock', '<blockquote>'); onInput(); }}>❝</button>
        <span className="rte-sep" />
        <button style={btn} title="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('insertUnorderedList'); onInput(); }}>•≡</button>
        <button style={btn} title="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('insertOrderedList'); onInput(); }}>1≡</button>
        <span className="rte-sep" />
        <button style={btn} title="Link" onMouseDown={(e) => e.preventDefault()} onClick={link}>🔗</button>
        <button style={btn} title="Remove link" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('unlink'); onInput(); }}>🔗✕</button>
        <button style={btn} title="Inline code" onMouseDown={(e) => e.preventDefault()} onClick={() => insertHTML('<code>code</code>')}>&lt;/&gt;</button>
        <button style={btn} title="Code block" onMouseDown={(e) => e.preventDefault()} onClick={() => insertHTML('<pre><code>SELECT * FROM users;\n</code></pre>')}>▦/&gt;</button>
        <span className="rte-sep" />
        <button style={btn} title="Image" onMouseDown={(e) => e.preventDefault()} onClick={image}>🖼️</button>
        <button style={btn} title="Table" onMouseDown={(e) => e.preventDefault()} onClick={() => insertHTML('<table style="border-collapse:collapse;width:100%;margin:16px 0;"><tr><th style="border:1px solid #ccc;padding:8px;">Col 1</th><th style="border:1px solid #ccc;padding:8px;">Col 2</th></tr><tr><td style="border:1px solid #ccc;padding:8px;">a</td><td style="border:1px solid #ccc;padding:8px;">b</td></tr></table>')}>▦</button>
        <span className="rte-sep" />
        <button style={btn} title="💡 Tip box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('tip', '💡 Tip', '#10b981', 'rgba(16,185,129,0.10)')}>💡</button>
        <button style={btn} title="📝 Note box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('note', '📝 Note', '#667eea', 'rgba(102,126,234,0.10)')}>📝</button>
        <button style={btn} title="⚠️ Warning box" onMouseDown={(e) => e.preventDefault()} onClick={() => callout('warning', '⚠️ Warning', '#f59e0b', 'rgba(245,158,11,0.12)')}>⚠️</button>
        <span className="rte-sep" />
        <select
          style={{ ...btn, height: 30, padding: '0 4px' }}
          title="Text size"
          onChange={(e) => {
            const v = e.target.value;
            e.target.value = '';
            if (v) { exec('fontSize', v); onInput(); }
          }}
          defaultValue=""
        >
          <option value="" disabled>Aa</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="6">X-Large</option>
        </select>
        <input
          type="color"
          title="Text color"
          style={{ width: 32, height: 30, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', padding: 0 }}
          onChange={(e) => { exec('foreColor', e.target.value); onInput(); }}
        />
        <button style={btn} title="Clear formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('removeFormat'); onInput(); }}>🧹</button>
        <button style={btn} title="Paste as plain text" onClick={pastePlain}>📋T</button>
      </div>

      {/* EDITOR */}
      <div
        ref={ref}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onBlur={onInput}
        data-placeholder="Blogger jaisa — yahan type karo... (Bold ke liye select karke B dabao)"
      />

      <div className="rte-hint">
        ✍️ Yahan type karo — HTML <b>apne aap</b> banta hai. <b>HTML tab</b> mein source dekho/edit karo, <b>Preview tab</b> mein final look.
      </div>
    </div>
  );
}
