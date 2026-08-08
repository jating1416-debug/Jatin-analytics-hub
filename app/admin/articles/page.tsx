'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Article = {
  id: number;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  updatedAt: string;
  category: { name: string; slug: string } | null;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status !== 'ALL') params.set('status', status);
      const res = await fetch('/api/articles?' + params.toString());
      if (res.ok) setArticles(await res.json());
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status, q]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const del = async (id: number) => {
    if (!confirm('Post delete karni hai? (ye wapas nahi aayegi!)')) return;
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'ok', text: '🗑️ Post deleted' }); load(); }
    else setMsg({ type: 'err', text: 'Delete fail' });
  };

  const bulk = async (action: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'DELETE') => {
    if (selected.size === 0) return;
    if (action === 'DELETE' && !confirm(`${selected.size} posts delete?`)) return;
    let ok = 0, fail = 0;
    for (const id of selected) {
      const res = action === 'DELETE'
        ? await fetch(`/api/articles/${id}`, { method: 'DELETE' })
        : await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action }),
          });
      if (res.ok) ok++; else fail++;
    }
    setMsg({ type: ok > 0 ? 'ok' : 'err', text: `✅ ${ok} done${fail ? ` | ❌ ${fail} fail` : ''}` });
    setSelected(new Set());
    load();
  };

  const statusBadge = (s: string) => ({
    fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 12,
    background: s === 'PUBLISHED' ? 'rgba(22,163,74,0.14)' : s === 'DRAFT' ? 'rgba(245,158,11,0.14)' : 'rgba(100,116,139,0.15)',
    color: s === 'PUBLISHED' ? '#16a34a' : s === 'DRAFT' ? '#f59e0b' : '#64748b',
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>📄 All Articles ({articles.length})</h2>
        <Link className="read-more-btn" href="/admin/articles/new"><i className="fas fa-plus" /> New Article</Link>
      </div>

      {msg && <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.88rem', marginBottom: 10 }}>{msg.text}</p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title..."
          style={{ flex: 1, minWidth: 180, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.85rem' }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)' }}>
          <option value="ALL">All</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, padding: 10, background: 'var(--bg)', borderRadius: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{selected.size} selected:</span>
          <button onClick={() => bulk('PUBLISHED')} className="read-more-btn" style={{ border: 'none', padding: '6px 14px', fontSize: '0.75rem' }}>✅ Publish</button>
          <button onClick={() => bulk('DRAFT')} className="read-more-btn" style={{ border: 'none', padding: '6px 14px', fontSize: '0.75rem', background: 'var(--secondary)' }}>📝 Draft</button>
          <button onClick={() => bulk('DELETE')} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>🗑️ Delete</button>
        </div>
      )}

      {loading && (
        <div className="sidebar-widget" style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Loading articles...
        </div>
      )}

      {!loading && (
      <div className="sidebar-widget" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', width: 34 }}><input type="checkbox" onChange={(e) => {
                if (e.target.checked) setSelected(new Set(articles.map((a) => a.id)));
                else setSelected(new Set());
              }} /></th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Views</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px' }}><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} /></td>
                <td style={{ padding: '9px 12px', maxWidth: 260 }}>
                  <Link href={`/admin/articles/${a.id}/edit`} style={{ fontWeight: 600 }}>{a.title.slice(0, 55)}</Link>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>/{a.category?.slug || 'post'}/{a.slug}</div>
                </td>
                <td style={{ padding: '9px 12px' }}>{a.category?.name || '-'}</td>
                <td style={{ padding: '9px 12px' }}><span style={statusBadge(a.status)}>{a.status}</span></td>
                <td style={{ padding: '9px 12px' }}>{a.viewCount}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <Link href={`/admin/articles/${a.id}/edit`} style={{ color: 'var(--primary)', marginRight: 8 }}><i className="fas fa-edit" /> Edit</Link>
                  <a href={`/${a.category?.slug || 'post'}/${a.slug}`} target="_blank" rel="noopener" style={{ color: 'var(--text-light)', marginRight: 8 }}><i className="fas fa-eye" /> View</a>
                  <button onClick={() => del(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash" /></button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Koi article nahi mila.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
