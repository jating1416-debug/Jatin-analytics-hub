'use client';

import { useEffect, useState } from 'react';

// ADMIN PAGES - static pages manager (Blogger Pages jaisa) - admin UI se About/Contact/Privacy
type Page = { id: number; slug: string; title: string; content: string; published: boolean; updatedAt: string };

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    const res = await fetch('/api/pages');
    if (res.ok) setPages(await res.json());
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setMsg(null);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/pages/${editId}` : '/api/pages';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, title, content, published }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg({ type: 'ok', text: editId ? '✅ Page updated' : '✅ Page created' });
      setSlug(''); setTitle(''); setContent(''); setPublished(true); setEditId(null);
      load();
    } else setMsg({ type: 'err', text: d.error || 'Error' });
  };

  const del = async (id: number) => {
    if (!confirm('Page delete karni hai?')) return;
    const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'ok', text: '🗑️ Page deleted' }); load(); }
  };

  const startEdit = (p: Page) => {
    setEditId(p.id); setSlug(p.slug); setTitle(p.title); setContent(p.content); setPublished(p.published);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', marginBottom: 10,
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>📄 Pages <span className="admin-count-badge">{pages.length}</span></h1>
          <p className="admin-page-sub">About / Contact / Privacy — admin UI se banao, koi code nahi</p>
        </div>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* FORM */}
      <div className="admin-panel" style={{ marginBottom: 18 }}>
        <div className="admin-panel-head">
          <h2>{editId ? <><i className="fas fa-pen" /> Edit Page</> : <><i className="fas fa-plus" /> New Page</>}</h2>
          {editId && <button className="admin-quick-btn" style={{ padding: '6px 12px' }} onClick={() => { setEditId(null); setSlug(''); setTitle(''); setContent(''); setPublished(true); }}>✕ Cancel</button>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Slug (URL) *</label>
            <input style={inp} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="about / contact / privacy-policy" />
          </div>
          <div>
            <label style={lbl}>Title *</label>
            <input style={inp} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="About Us" />
          </div>
        </div>
        <label style={lbl}>Content (HTML allowed)</label>
        <textarea style={{ ...inp, minHeight: 160, fontFamily: "'Fira Code', monospace", fontSize: '0.8rem' }} value={content} onChange={(e) => setContent(e.target.value)} placeholder={'<h2>Heading</h2>\n<p>Content yahan...</p>'} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published (live)
        </label>
        <button className="admin-cta-btn" onClick={save} style={{ border: 'none', cursor: 'pointer' }}>
          <i className="fas fa-save" /> {editId ? 'Update Page' : 'Create Page'}
        </button>
      </div>

      {/* LIST */}
      {pages.length === 0 ? (
        <div className="admin-panel" style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>
          Abhi koi page nahi — upar se pehla page banao!
        </div>
      ) : (
        <div className="admin-cat-grid">
          {pages.map((p) => (
            <div key={p.id} className="admin-cat-card">
              <div className="admin-cat-icon">📄</div>
              <div className="admin-cat-body">
                <div className="admin-cat-name">{p.title}</div>
                <div className="admin-cat-slug">/{p.slug}</div>
                <div className="admin-cat-desc">{p.content.replace(/<[^>]+>/g, '').slice(0, 60)}...</div>
              </div>
              <div className="admin-cat-foot">
                <span className={`admin-status-pill ${p.published ? 'pub' : 'draft'}`}>{p.published ? 'LIVE' : 'DRAFT'}</span>
                <span className="admin-cat-actions">
                  <a href={`/p/${p.slug}`} target="_blank" rel="noopener" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }} title="View"><i className="fas fa-eye" /></a>
                  <button onClick={() => startEdit(p)} title="Edit"><i className="fas fa-pen" /></button>
                  <button onClick={() => del(p.id)} title="Delete" className="del"><i className="fas fa-trash" /></button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
