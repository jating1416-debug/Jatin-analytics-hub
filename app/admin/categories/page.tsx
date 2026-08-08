'use client';

import { useEffect, useState } from 'react';

type Category = { id: number; name: string; slug: string; description: string | null; icon: string | null; _count?: { articles: number } };

// ADMIN CATEGORIES v2 - premium card grid (sab logic same)
export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [desc, setDesc] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    const res = await fetch('/api/categories');
    if (res.ok) setCategories(await res.json());
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    setMsg(null);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon, description: desc }),
    });
    const data = await res.json();
    if (res.ok) { setMsg({ type: 'ok', text: '✅ Category added' }); setName(''); setIcon(''); setDesc(''); load(); }
    else setMsg({ type: 'err', text: data.error || 'Error' });
  };

  const rename = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) { setEditId(null); load(); }
  };

  const del = async (id: number) => {
    if (!confirm('Category delete karni hai? (articles pehle change karo)')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) load();
    else setMsg({ type: 'err', text: data.error || 'Error' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-dark)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: 10,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: 4 };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>🗂️ Categories <span className="admin-count-badge">{categories.length}</span></h1>
          <p className="admin-page-sub">Add, rename ya delete — sab yahin se</p>
        </div>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* ADD CATEGORY */}
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2><i className="fas fa-plus" /> Add New Category</h2>
        </div>
        <div className="admin-form-grid">
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tableau" />
          </div>
          <div>
            <label style={labelStyle}>Icon (emoji)</label>
            <input style={inputStyle} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📊" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Kis baare mein hai ye category" />
          </div>
        </div>
        <button onClick={add} className="admin-cta-btn" style={{ border: 'none', cursor: 'pointer' }}>
          <i className="fas fa-plus" /> Add Category
        </button>
      </div>

      {/* CATEGORY CARDS */}
      <div className="admin-cat-grid">
        {categories.map((c) => (
          <div key={c.id} className="admin-cat-card">
            <div className="admin-cat-icon">{c.icon || '📁'}</div>
            <div className="admin-cat-body">
              {editId === c.id ? (
                <div className="admin-cat-edit">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') rename(c.id); }}
                    autoFocus
                  />
                  <button onClick={() => rename(c.id)} className="admin-mini-btn ok"><i className="fas fa-check" /></button>
                  <button onClick={() => setEditId(null)} className="admin-mini-btn"><i className="fas fa-xmark" /></button>
                </div>
              ) : (
                <>
                  <div className="admin-cat-name">{c.name}</div>
                  <div className="admin-cat-slug">/{c.slug}</div>
                </>
              )}
              {c.description && <div className="admin-cat-desc">{c.description.slice(0, 60)}</div>}
            </div>
            <div className="admin-cat-foot">
              <span className="admin-cat-count"><i className="fas fa-file-lines" /> {c._count?.articles ?? 0} posts</span>
              <span className="admin-cat-actions">
                <button
                  onClick={() => { setEditId(c.id); setEditName(c.name); }}
                  title="Rename"
                ><i className="fas fa-pen" /></button>
                <button onClick={() => del(c.id)} title="Delete" className="del"><i className="fas fa-trash" /></button>
              </span>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="category-empty" style={{ gridColumn: '1 / -1', display: 'block' }}>
            <p>Abhi koi category nahi — upar se pehli category add karo!</p>
          </div>
        )}
      </div>
    </>
  );
}
