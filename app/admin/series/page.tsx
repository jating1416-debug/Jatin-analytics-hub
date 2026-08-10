'use client';

import { useEffect, useState } from 'react';

// ADMIN SERIES - post series manager (Part 1, Part 2...)
type Series = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  articles: { id: number; title: string; slug: string; category: { slug: string } | null; seriesOrder: number | null }[];
};

export default function AdminSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    const res = await fetch('/api/series');
    if (res.ok) setSeries(await res.json());
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim()) { setMsg({ type: 'err', text: 'Title zaroori hai' }); return; }
    const res = await fetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc }),
    });
    const d = await res.json();
    if (res.ok) { setMsg({ type: 'ok', text: '✅ Series ban gayi!' }); setTitle(''); setDesc(''); load(); }
    else setMsg({ type: 'err', text: d.error || 'Error' });
  };

  const del = async (id: number) => {
    if (!confirm('Series delete karni hai? (articles pe asar nahi hoga)')) return;
    const res = await fetch(`/api/series/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'ok', text: '🗑️ Series deleted' }); load(); }
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
          <h1>🔗 Post Series <span className="admin-count-badge">{series.length}</span></h1>
          <p className="admin-page-sub">Part 1 → Part 2 → Part 3 — series banao, phir article editor mein assign karo</p>
        </div>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* ADD */}
      <div className="admin-panel" style={{ marginBottom: 18 }}>
        <div className="admin-panel-head"><h2><i className="fas fa-plus" /> New Series</h2></div>
        <label style={lbl}>Title *</label>
        <input style={inp} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Python Pandas Mastery" />
        <label style={lbl}>Description</label>
        <input style={inp} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Is series mein kya seekhoge..." />
        <button className="admin-cta-btn" onClick={add} style={{ border: 'none', cursor: 'pointer' }}><i className="fas fa-plus" /> Create Series</button>
      </div>

      {/* LIST */}
      {series.length === 0 ? (
        <div className="admin-panel" style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>
          Abhi koi series nahi — upar se pehli banao!
        </div>
      ) : (
        <div className="admin-cat-grid">
          {series.map((s) => (
            <div key={s.id} className="admin-cat-card">
              <div className="admin-cat-icon">🔗</div>
              <div className="admin-cat-body">
                <div className="admin-cat-name">{s.title}</div>
                <div className="admin-cat-slug">/series/{s.slug}</div>
                {s.description && <div className="admin-cat-desc">{s.description.slice(0, 60)}</div>}
                <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-light)' }}>
                  {s.articles.length} articles {s.articles.length > 0 && '— ' + s.articles.map((a) => `#${a.seriesOrder ?? '?'}`).join(', ')}
                </div>
              </div>
              <div className="admin-cat-foot">
                <a href={`/series/${s.slug}`} target="_blank" rel="noopener" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>View →</a>
                <span className="admin-cat-actions">
                  <button onClick={() => del(s.id)} title="Delete" className="del"><i className="fas fa-trash" /></button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-panel" style={{ marginTop: 18 }}>
        <div className="admin-panel-head"><h2><i className="fas fa-info-circle" /> Kaise use kare</h2></div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.8 }}>
          1. Series banao (upar) — e.g. "SQL Window Functions"<br />
          2. Kisi article ke <b>Edit</b> mein jao → <b>Series</b> field mein series chuno + <b>Order</b> (Part number)<br />
          3. Article page pe <b>Series navigation</b> (Part 1 → Part 2 → Part 3) automatic dikhega + <b>/series/slug</b> page pe saare parts
        </p>
      </div>
    </>
  );
}
