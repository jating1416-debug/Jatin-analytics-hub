'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SeoChecker from '@/components/admin/SeoChecker';
import RichTextEditor from '@/components/admin/RichTextEditor';

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
    scheduledAt?: string | null;
    noindex?: boolean;
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
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt || '');
  const [noindex, setNoindex] = useState(initial?.noindex || false);
  const [autoSaving, setAutoSaving] = useState(false);
  const lastSavedRef = useRef(JSON.stringify({ title: initial?.title, content: initial?.content }));
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
      // tag ko post content mein bhi visible span ke roop mein jodo
      setContent((c) => c + `<span style="background:rgba(102,126,234,0.15);color:var(--primary);padding:2px 8px;border-radius:10px;font-size:0.85rem;font-weight:600;">${t}</span> `);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  // ---------- DRAFT AUTOSAVE (har 30 sec, kuch bhi nahi jayega) ----------
  useEffect(() => {
    const iv = setInterval(() => {
      const snapshot = JSON.stringify({ title, content, excerpt, categoryId });
      if (snapshot === lastSavedRef.current) return; // koi change nahi
      if (!title.trim() && !content.trim()) return;
      setAutoSaving(true);
      fetch(articleId ? `/api/articles/${articleId}` : '/api/articles', {
        method: articleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Draft',
          slug, content, excerpt, categoryId, status: 'DRAFT',
          coverImage, metaDescription, tags, featured, scheduledAt: scheduledAt || undefined,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          lastSavedRef.current = snapshot;
          if (!articleId && d.id) window.history.replaceState(null, '', `/admin/articles/${d.id}/edit`);
        })
        .catch(() => {})
        .finally(() => setAutoSaving(false));
    }, 30000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, excerpt, categoryId, slug, coverImage, metaDescription, tags, featured, scheduledAt]);

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
          scheduledAt: scheduledAt || undefined,
          noindex,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        lastSavedRef.current = JSON.stringify({ title, content, excerpt, categoryId });
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
        {autoSaving && <span style={{ alignSelf: 'center', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}><i className="fas fa-sync fa-spin" /> Autosave...</span>}
        {!autoSaving && !uploading && <span style={{ alignSelf: 'center', fontSize: '0.72rem', color: 'var(--text-light)' }}>💾 Har 30 sec auto-save</span>}
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
            <option value="SCHEDULED">Scheduled</option>
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

      {/* SCHEDULE (Blogger jaisa) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Schedule Publish (optional)</label>
          <input
            type="datetime-local"
            style={inputStyle}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>SEO: Noindex</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 12 }}>
            <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>Google ko is page pe index nahi karna (private posts)</span>
          </label>
        </div>
      </div>
      {status === 'SCHEDULED' && !scheduledAt && (
        <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, marginBottom: 10 }}>
          ⚠️ Status SCHEDULED hai — upar date/time bhi choose karo!
        </div>
      )}
      {scheduledAt && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 12 }}>
          📅 Is time pe auto-publish hoga: {new Date(scheduledAt).toLocaleString('en-IN')}
        </div>
      )}

      {/* ---------- EDITOR MODE SWITCH ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 10px', flexWrap: 'wrap', gap: 8 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Content *</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setMode('write')} style={{ ...toolbarBtn, background: mode === 'write' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'write' ? '#fff' : 'var(--text-dark)' }}>✍️ Write</button>
          <button onClick={() => setMode('html')} style={{ ...toolbarBtn, background: mode === 'html' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'html' ? '#fff' : 'var(--text-dark)' }}>{'< >'} HTML</button>
          <button onClick={() => setMode('preview')} style={{ ...toolbarBtn, background: mode === 'preview' ? 'var(--gradient)' : 'var(--bg)', color: mode === 'preview' ? '#fff' : 'var(--text-dark)' }}>👁️ Preview</button>
        </div>
      </div>

      {/* ---------- WRITE MODE: Blogger-style WYSIWYG (type karo, HTML khud banta hai) ---------- */}
      {mode === 'write' && (
        <RichTextEditor value={content} onChange={setContent} />
      )}

      {/* ---------- HTML MODE ---------- */}
      {mode === 'html' ? (
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
      ) : mode === 'preview' ? (
        <div
          className="post-body entry-content"
          style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, minHeight: 420, fontSize: '1rem', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: content || '<p style="color:var(--text-light)">Preview yahan dikhega...</p>' }}
        />
      ) : null}
    </div>
  );
}
