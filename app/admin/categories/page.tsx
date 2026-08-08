'use client';

import { useEffect, useState } from 'react';

type Category = { id: number; name: string; slug: string; description: string | null; icon: string | null; _count?: { articles: number } };

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
      <h2 className="section-title">🗂️ Categories Management</h2>

      {msg && <p style={{ color: msg.type === 'ok' ? '#16a34a' : '#ef4444', fontSize: '0.88rem', marginBottom: 12 }}>{msg.text}</p>}

      <div className="sidebar-widget" style={{ marginBottom: 16 }}>
        <div className="widget-title"><i className="fas fa-plus" /> Add New Category</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tableau" />
          </div>
          <div>
            <label style={labelStyle}>Icon (emoji)</label>
            <input style={inputStyle} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📊" />
          </div>
        </div>
        <label style={labelStyle}>Description</label>
        <input style={inputStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Kis baare mein hai ye category" />
        <button onClick={add} className="read-more-btn" style={{ border: 'none' }}>+ Add Category</button>
      </div>

      <div className="sidebar-widget" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Slug</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Posts</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 12px' }}>
                  {editId === c.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', color: 'var(--text-dark)' }} />
                      <button onClick={() => rename(c.id)} className="read-more-btn" style={{ border: 'none', padding: '5px 12px', fontSize: '0.75rem' }}>Save</button>
                    </div>
                  ) : (
                    <b>{c.icon} {c.name}</b>
                  )}
                </td>
                <td style={{ padding: '9px 12px', color: 'var(--text-light)', fontSize: '0.78rem' }}>{c.slug}</td>
                <td style={{ padding: '9px 12px' }}>{c._count?.articles ?? 0}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => { setEditId(c.id); setEditName(c.name); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: 8 }}
                  ><i className="fas fa-edit" /> Rename</button>
                  <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash" /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
