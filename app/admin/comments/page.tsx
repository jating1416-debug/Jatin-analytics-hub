'use client';

import { useEffect, useState } from 'react';

// ADMIN COMMENTS - saare comments + approve/pending/spam + delete (Blogger jaisa)
type Comment = {
  id: number;
  name: string;
  content: string;
  status: string;
  createdAt: string;
  article: { title: string; slug: string; category: { slug: string } | null } | null;
};

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments?all=1');
      if (res.ok) setComments(await res.json());
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMsg({ type: 'ok', text: '✅ Comment updated' });
      load();
    } else setMsg({ type: 'err', text: 'Update fail' });
  };

  const del = async (id: number) => {
    if (!confirm('Comment delete karni hai?')) return;
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'ok', text: '🗑️ Comment deleted' }); load(); }
  };

  const filtered = filter === 'ALL' ? comments : comments.filter((c) => c.status === filter);
  const counts = {
    ALL: comments.length,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
    spam: comments.filter((c) => c.status === 'spam').length,
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>💬 Comments <span className="admin-count-badge">{comments.length}</span></h1>
          <p className="admin-page-sub">
            {counts.pending > 0 && <span style={{ color: '#f59e0b', fontWeight: 800 }}>⚠️ {counts.pending} pending approve karne hain! </span>}
            Approve / Spam / Delete — Blogger jaisa
          </p>
        </div>
      </div>

      {msg && <p className={`admin-msg ${msg.type === 'ok' ? 'ok' : 'err'}`}>{msg.text}</p>}

      {/* STATUS TABS */}
      <div className="admin-status-tabs" style={{ marginBottom: 14 }}>
        {['ALL', 'pending', 'approved', 'spam'].map((t) => (
          <button key={t} className={`admin-status-tab${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'ALL' ? 'All' : t[0].toUpperCase() + t.slice(1)} ({counts[t as keyof typeof counts]})
          </button>
        ))}
      </div>

      {loading && (
        <div className="admin-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
          <i className="fas fa-spinner fa-spin" /> Loading...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="admin-panel" style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>
          {filter === 'ALL' ? 'Abhi koi comment nahi aaya.' : `Is folder mein koi comment nahi.`}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="admin-panel" style={{ padding: '6px 16px' }}>
          {filtered.map((c) => (
            <div key={c.id} className="admin-comment-row">
              <span className="admin-comment-avatar">💬</span>
              <div className="admin-comment-body" style={{ flex: 1 }}>
                <div className="admin-comment-top">
                  <b>{c.name}</b>
                  <span className="admin-comment-date">
                    {new Date(c.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="admin-comment-text">{c.content}</div>
                {c.article && (
                  <a className="admin-comment-link" href={`/${c.article.category?.slug || 'post'}/${c.article.slug}`} target="_blank" rel="noopener">
                    on: {c.article.title.slice(0, 50)}
                  </a>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {c.status === 'pending' && (
                    <button className="admin-bulk-btn pub" onClick={() => setStatus(c.id, 'approved')}><i className="fas fa-check" /> Approve</button>
                  )}
                  {c.status !== 'spam' && (
                    <button className="admin-bulk-btn draft" style={{ background: '#64748b' }} onClick={() => setStatus(c.id, 'spam')}><i className="fas fa-flag" /> Spam</button>
                  )}
                  {c.status !== 'approved' && (
                    <button className="admin-bulk-btn pub" style={{ background: '#16a34a' }} onClick={() => setStatus(c.id, 'approved')}><i className="fas fa-check" /> Approve</button>
                  )}
                  <button className="admin-bulk-btn del" onClick={() => del(c.id)}><i className="fas fa-trash" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
