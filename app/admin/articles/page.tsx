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

// ADMIN ARTICLES v2 - premium table (sab logic same, naya design)
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

  const STATUS_TABS = [
    { key: 'ALL', label: 'All' },
    { key: 'PUBLISHED', label: 'Published' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>📄 All Articles <span className="admin-count-badge">{articles.length}</span></h1>
          <p className="admin-page-sub">Search, filter, bulk publish/draft — sab yahin se</p>
        </div>
        <Link className="admin-cta-btn" href="/admin/articles/new"><i className="fas fa-plus" /> New Article</Link>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* TOOLBAR: search + status tabs */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <i className="fas fa-search" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title..."
          />
        </div>
        <div className="admin-status-tabs">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-status-tab${status === t.key ? ' active' : ''}`}
              onClick={() => setStatus(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* BULK BAR */}
      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-count">{selected.size} selected</span>
          <button onClick={() => bulk('PUBLISHED')} className="admin-bulk-btn pub"><i className="fas fa-circle-check" /> Publish</button>
          <button onClick={() => bulk('DRAFT')} className="admin-bulk-btn draft"><i className="fas fa-pen" /> Draft</button>
          <button onClick={() => bulk('DELETE')} className="admin-bulk-btn del"><i className="fas fa-trash" /> Delete</button>
        </div>
      )}

      {loading && (
        <div className="admin-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Loading articles...
        </div>
      )}

      {!loading && (
        <div className="admin-panel" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    className="admin-check"
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(articles.map((a) => a.id)));
                      else setSelected(new Set());
                    }}
                  />
                </th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className={selected.has(a.id) ? 'selected' : ''}>
                  <td><input type="checkbox" className="admin-check" checked={selected.has(a.id)} onChange={() => toggle(a.id)} /></td>
                  <td className="admin-title-cell">
                    <Link href={`/admin/articles/${a.id}/edit`}>{a.title.slice(0, 55)}</Link>
                    <div className="admin-slug">/{a.category?.slug || 'post'}/{a.slug}</div>
                  </td>
                  <td>{a.category ? <span className="admin-chip">{a.category.name}</span> : <span className="admin-chip muted">—</span>}</td>
                  <td>
                    <span className={`admin-status-pill ${a.status === 'PUBLISHED' ? 'pub' : a.status === 'DRAFT' ? 'draft' : 'arch'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td><span className="admin-views-badge"><i className="fas fa-eye" /> {a.viewCount.toLocaleString()}</span></td>
                  <td className="admin-row-actions">
                    <Link href={`/admin/articles/${a.id}/edit`} title="Edit"><i className="fas fa-pen" /></Link>
                    <a href={`/${a.category?.slug || 'post'}/${a.slug}`} target="_blank" rel="noopener" title="View live"><i className="fas fa-external-link" /></a>
                    <button onClick={() => del(a.id)} title="Delete"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: 'var(--text-light)' }}>
                  😕 Koi article nahi mila — filter/search change karke dekho.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
