'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SeoChecker from '@/components/admin/SeoChecker';

type Category = { id: number; name: string; slug: string };

export default function ArticleEditor({
  categories,
  initial,
  articleId,
}: {
  categories: Category[];
  initial?: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    categoryId: number;
    status: string;
    coverImage: string;
    metaDescription: string;
    tags: string[];
    featured: boolean;
  };
  articleId?: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [content, setContent] = useState(initial?.content || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id || 0);
  const [status, setStatus] = useState(initial?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initial?.coverImage || '');
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || '');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [mode, setMode] = useState<'write' | 'html' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700,
    color: 'var(--text-light)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px',
  };
  const toolbarBtn: React.CSSProperties = {
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dark)',
    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
    marginRight: 4,
  };

  // ---------- WYSIWYG helpers ----------
  const wrapSelection = (before: string, after: string) => {
    const area = document.getElementById('rich-editor') as HTMLTextAreaElement | null;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    setTimeout(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertTag = (tag: string) => {
    const open = `<span style="background:rgba(102,126,234,0.15);color:var(--primary);padding:2px 8px;border-radius:10px;font-size:0.85rem;font-weight:600;">`;
    wrapSelection(open, `</span>`);
  };

  const insertCallout = (type: string, label: string, color: string, bg: string) => {
    const block = `\n\n<div class="callout callout-${type}" style="border-radius:10px;padding:14px 18px;margin:18px 0;border-left:4px solid ${color};background:${bg}"><b>${label}</b><br/></div>\n\n`;
    const area = document.getElementById('rich-editor') as HTMLTextAreaElement | null;
    if (!area) return;
    const start = area.selectionStart;
    setContent(content.slice(0, start) + block + content.slice(start));
    setTimeout(() => {
      area.focus();
      area.setSelectionRange(start + block.length - 7, start + block.length - 7);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const tag = `<h${level}>`;
    wrapSelection(tag, `</h${level}>`);
  };

  const applyFontSize = (size: string) => {
    wrapSelection(`<span style="font-size:${size}">`, `</span>`);
  };

  const applyColor = (color: string) => {
    wrapSelection(`<span style="color:${color}">`, `</span>`);
  };

  // ---------- Image upload (Supabase Storage via API) ----------
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        setMsg({ type: 'ok', text: '✅ Image uploaded!' });
      } else {
        setMsg({ type: 'err', text: data.error || 'Upload failed' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Upload error' });
    } finally {
      setUploading(false);
    }
  };

  // ---------- Tags ----------
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      insertTag(t);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  // ---------- Save ----------
  const save = async (finalStatus?: string) => {
    setSaving(true);
    setMsg(null);
    const target = finalStatus || status;
    try {
      const res = await fetch(articleId ? `/api/articles/${articleId}` : '/api/articles', {
        method: articleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, content, excerpt, categoryId, status: target,
          coverImage, metaDescription, tags, featured,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const catName = categories.find((c) => c.id === categoryId)?.name || '';
        setMsg({
          type: 'ok',
          text: target === 'PUBLISHED'
            ? `✅ Published! Category: ${catName}`
            : `💾 Draft saved. Category: ${catName}`,
        });
        if (!articleId && data.id) {
          router.push(`/admin/articles/${data.id}/edit`);
          router.refresh();
        } else {
          router.refresh();
        }
      } else {
        setMsg({ type: 'err', text: data.error || 'Save failed' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  // ---------- LIVE STATS (word count / reading time) ----------
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(' ').length : 0;
  const readMins = Math.max(1, Math.round(wordCount / 200));
  const catSlug = categories.find((c) => c.id === categoryId)?.slug;

  return (
    <div>
      {/* SAVE ACTION BAR */}
      <div className="admin-editor-actions">
        <button className="admin-cta-btn" onClick={() => save('PUBLISHED')} disabled={saving} style={{ opacity: saving ? 0.6 : 1, border: 'none', cursor: 'pointer' }}>
          <i className="fas fa-globe" /> {articleId ? 'Update & Publish' : 'Publish'}
        </button>
        <button
          onClick={() => save('DRAFT')} disabled={saving}
          className="admin-save-draft"
        >
          <i className="fas fa-save" /> Save Draft
        </button>
        {articleId && slug && (
          <a className="admin-view-live" href={`/${catSlug || 'post'}/${slug}`} target="_blank" rel="noopener">
            <i className="fas fa-external-link" /> View Post
          </a>
        )}
        {uploading && <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>⏳ Uploading...</span>}
        <span className="admin-editor-stats">
          <span><i className="fas fa-file-word" /> {wordCount.toLocaleString()} words</span>
          <span><i className="fas fa-clock" /> {readMins} min read</span>
          <span><i className="fas fa-text-height" /> {content.length.toLocaleString()} chars</span>
        </span>
      </div>

      {msg && (
        <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.88rem', marginBottom: 12 }}>{msg.text}</p>
      )}

      {/* SEO CHECKER - live (Yoast jaisa) */}
      <SeoChecker title={title} metaDescription={metaDescription} slug={slug} content={content} tags={tags} />

      <label style={labelStyle}>Title *</label>
      <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post ka title" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Category *</label>
          <select style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>Slug (URL) — optional</label>
      <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-se banta hai (title se)" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Cover Image URL</label>
          <input style={inputStyle} value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Ya File Upload (Supabase Storage)</label>
          <input type="file" accept="image/*" onChange={onUpload} style={{ ...inputStyle, padding: '8px' }} />
        </div>
      </div>

      <label style={labelStyle}>Tags — comma separated (enter dabao)</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="e.g. pandas, window functions"
        />
        <button onClick={addTag} className="read-more-btn" style={{ border: 'none' }}>Add</button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {tags.map((t) => (
            <span key={t} style={{ background: 'rgba(102,126,234,0.15)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 14, fontSize: '0.78rem', fontWeight: 600 }}>
              {t} <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 4 }}>×</button>
            </span>
          ))}
        </div>
      )}

      <label style={labelStyle}>Meta Description (SEO) — optional</label>
      <textarea style={{ ...inputStyle, minHeight: 60 }} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Google search result mein dikhegi" />

      <label style={labelStyle}>Excerpt — optional (khali chhodo to auto banega)</label>
      <textarea style={{ ...inputStyle, minHeight: 60 }} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="2 lines ka summary" />

      <label style={labelStyle}>Featured (homepage highlight)</label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>Is post ko homepage pe featured karo ⭐</span>
      </label>

      {/* ---------- EDITOR MODE SWITCH ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 10px', flexWrap: 'wrap', gap: 8 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Content *</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setMode('write')} style={{ ...toolbarBtn, background: mode === 'write' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'write' ? '#fff' : 'var(--text-dark)' }}>✍️ Write</button>
          <button onClick={() => setMode('html')} style={{ ...toolbarBtn, background: mode === 'html' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'html' ? '#fff' : 'var(--text-dark)' }}>{'< >'} HTML</button>
          <button onClick={() => setMode('preview')} style={{ ...toolbarBtn, background: mode === 'preview' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'preview' ? '#fff' : 'var(--text-dark)' }}>👁️ Preview</button>
        </div>
      </div>

      {/* ---------- WYSIWYG TOOLBAR (write mode) ---------- */}
      {mode === 'write' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card-bg)' }}>
          <button style={toolbarBtn} onClick={() => wrapSelection('<b>', '</b>')} title="Bold"><b>B</b></button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<i>', '</i>')} title="Italic"><i>I</i></button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<u>', '</u>')} title="Underline"><u>U</u></button>
          <button style={toolbarBtn} onClick={() => insertHeading(2)} title="H2">H2</button>
          <button style={toolbarBtn} onClick={() => insertHeading(3)} title="H3">H3</button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<ul>\n  <li>', '</li>\n</ul>')} title="List">• List</button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<pre><code>', '</code></pre>')} title="Code block">&lt;/&gt; Code</button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<a href="https://" target="_blank">', '</a>')} title="Link">🔗</button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<img src="https://" alt="" style="max-width:100%;border-radius:8px;"/>', '')} title="Image">🖼️</button>
          <button style={toolbarBtn} onClick={() => wrapSelection('<table border="1" cellpadding="6" style="border-collapse:collapse;"><tr><th>Col1</th><th>Col2</th></tr><tr><td>a</td><td>b</td></tr></table>', '')} title="Table">▦ Table</button>
          <button style={toolbarBtn} onClick={() => insertCallout('tip', '💡 Tip', '#10b981', 'rgba(16,185,129,0.10)')} title="Tip box">💡 Tip</button>
          <button style={toolbarBtn} onClick={() => insertCallout('note', '📝 Note', '#667eea', 'rgba(102,126,234,0.10)')} title="Note box">📝 Note</button>
          <button style={toolbarBtn} onClick={() => insertCallout('warning', '⚠️ Warning', '#f59e0b', 'rgba(245,158,11,0.12)')} title="Warning box">⚠️ Warn</button>
          <span style={{ alignSelf: 'center', marginLeft: 4 }}>|</span>
          <select style={{ ...toolbarBtn, padding: '4px 6px' }} onChange={(e) => e.target.value && applyFontSize(e.target.value)} defaultValue="">
            <option value="" disabled>Text Size</option>
            <option value="0.85rem">Small</option>
            <option value="1rem">Normal</option>
            <option value="1.15rem">Large</option>
            <option value="1.3rem">X-Large</option>
            <option value="1.5rem">Heading</option>
          </select>
          <input type="color" title="Text Color" onChange={(e) => applyColor(e.target.value)} style={{ width: 34, height: 30, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 0 }} />
        </div>
      )}

      {/* ---------- EDITOR AREA ---------- */}
      {mode === 'write' ? (
        <textarea
          id="rich-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'Write your content here...\n\nUse the toolbar above to format. Click HTML tab to paste raw HTML code.'}
          style={{
            width: '100%', minHeight: 420, padding: 14, border: '1px solid var(--border)',
            borderRadius: 10, background: '#1e293b', color: '#e2e8f0',
            fontFamily: "'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.6,
            boxSizing: 'border-box', outline: 'none', whiteSpace: 'pre-wrap',
          }}
        />
      ) : mode === 'html' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'<h2>Section</h2>\n<p>Content yahan...</p>\n\n<!-- code block -->\n<pre><code>SELECT * FROM users;</code></pre>'}
          style={{
            width: '100%', minHeight: 420, padding: 14, border: '1px solid var(--border)',
            borderRadius: 10, background: '#0f172a', color: '#a5b4fc',
            fontFamily: "'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.6,
            boxSizing: 'border-box', outline: 'none', whiteSpace: 'pre',
          }}
        />
      ) : (
        <div
          className="post-body entry-content"
          style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, minHeight: 420, fontSize: '1rem', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: content || '<p style="color:var(--text-light)">Preview yahan dikhega...</p>' }}
        />
      )}
    </div>
  );
}
