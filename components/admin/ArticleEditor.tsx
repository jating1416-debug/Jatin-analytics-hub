'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700,
    color: 'var(--text-light)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px',
  };

  const save = async (finalStatus?: string) => {
    setSaving(true);
    setMsg(null);
    const target = finalStatus || status;
    try {
      const res = await fetch(articleId ? `/api/articles/${articleId}` : '/api/articles', {
        method: articleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug, content, excerpt, categoryId, status: target, coverImage, metaDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'ok', text: target === 'PUBLISHED' ? '✅ Published! Article live hai.' : '💾 Draft saved.' });
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

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          className="read-more-btn" onClick={() => save('PUBLISHED')} disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          <i className="fas fa-globe" /> {articleId ? 'Update & Publish' : 'Publish'}
        </button>
        <button
          onClick={() => save('DRAFT')} disabled={saving}
          style={{
            background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dark)',
            padding: '11px 22px', borderRadius: 24, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}
        >
          <i className="fas fa-save" /> Save Draft
        </button>
        <a href={articleId ? `/${initial?.slug ? '' : ''}${initial?.categoryId ? 'category/' : ''}` : '#'} style={{ display: 'none' }} />
      </div>

      {msg && (
        <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.88rem', marginBottom: 12 }}>
          {msg.text}
        </p>
      )}

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
          </select>
        </div>
      </div>

      <label style={labelStyle}>Slug (URL) — optional</label>
      <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-se banta hai (title se)" />

      <label style={labelStyle}>Cover Image URL — optional</label>
      <input style={inputStyle} value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />

      <label style={labelStyle}>Meta Description (SEO) — optional</label>
      <textarea style={{ ...inputStyle, minHeight: 60 }} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Google search result mein dikhegi" />

      <label style={labelStyle}>Excerpt — optional (khali chhodo to auto banega)</label>
      <textarea style={{ ...inputStyle, minHeight: 60 }} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="2 lines ka summary" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 10px' }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Content * (HTML)</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setMode('write')}
            style={{
              padding: '5px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              background: mode === 'write' ? 'var(--gradient)' : 'var(--bg)',
              color: mode === 'write' ? '#fff' : 'var(--text-dark)',
              border: '1px solid var(--border)',
            }}
          >
            Write
          </button>
          <button
            onClick={() => setMode('preview')}
            style={{
              padding: '5px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              background: mode === 'preview' ? 'var(--gradient)' : 'var(--bg)',
              color: mode === 'preview' ? '#fff' : 'var(--text-dark)',
              border: '1px solid var(--border)',
            }}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'<h2>Section</h2>\n<p>Content yahan...</p>\n\n<!-- code block -->\n<pre><code>SELECT * FROM users;</code></pre>'}
          style={{
            width: '100%', minHeight: 420, padding: 14, border: '1px solid var(--border)',
            borderRadius: 10, background: '#1e293b', color: '#e2e8f0',
            fontFamily: "'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.6,
            boxSizing: 'border-box', outline: 'none', whiteSpace: 'pre-wrap',
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
